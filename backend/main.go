package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	BannerService "services/bannerAPI"
	BannerEndpoint "services/bannerAPI/endpoint"
	firebaseService "services/firebase"
	"services/photoservice"
	redisclient "services/redis"
	"services/supabase/commentservice"
	CommentEndpoint "services/supabase/commentservice/endpoint"
	SupabaseLoginEndpoint "services/supabase/loginservice/endpoint"
	"services/supabase/newsservice"
	NewsEndpoint "services/supabase/newsservice/endpoint"
	SupabasePhotos "services/supabase/photoservice"
	SupabaseQuotes "services/supabase/quoteservice"
	SupabaseQuoteEndpoint "services/supabase/quoteservice/endpoint"
	SupabaseShines "services/supabase/shineservice"
	SupabaseShinesEndpoint "services/supabase/shineservice/endpoint"
	SupabaseUsers "services/supabase/userservice"
	SupabaseUserEndpoint "services/supabase/userservice/endpoint"
	"services/supabase/worldnewsapi"
	RecommendationService "services/tasks/recommendationAPI"
	RecommendationsEndpoint "services/tasks/recommendationAPI/endpoint"
	helpers "services/utils"

	"github.com/go-chi/chi/v5"
	"github.com/joho/godotenv"
	"github.com/robfig/cron/v3"
	"github.com/rs/cors"
)

func main() {
	envErr := godotenv.Load()
	if envErr != nil {
		log.Fatalf("Failed to load environment variables")
	}

	if photoservice.GetProjectId() == "" {
		log.Fatalf("FIREBASE_ADMIN_PROJECT_ID environment variable is not set. This is required for the photo service.")
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	clients, err := firebaseService.Init(ctx)
	if err != nil {
		log.Fatalf("Failed to initialize firebase client: %v", err)
	}
	defer clients.Close()

	newsClient := worldnewsapi.NewClient(os.Getenv("WORLD_NEWS_API_KEY"))
	redisClient := redisclient.NewClient(ctx)

	supabaseQuoteSvc := SupabaseQuotes.NewSupabaseService(clients.DB, redisClient)
	supabaseUserSvc := SupabaseUsers.NewSupabaseService(clients.DB, clients)
	supabasePhotoSvc := SupabasePhotos.NewSupabaseService(clients.DB, clients.Storage)
	supabaseShineSvc := SupabaseShines.NewService(clients.DB, supabaseUserSvc)
	bannerSvc := BannerService.NewService(supabaseUserSvc)
	commentSvc := commentservice.NewService(clients.DB, supabaseUserSvc, supabaseShineSvc)
	newsService := newsservice.NewService(clients.DB, newsClient, redisClient)
	recommendationsService := RecommendationService.NewService(supabaseUserSvc)

	cr := cron.New()

	cr.AddFunc("0 0 * * *", func() {
		log.Println("Starting daily news update...")
		newsService.UpdateDailyNews(context.Background(), 5, 0.9)
		supabaseQuoteSvc.UpdateAndStoreDailyQuote(context.Background())
	})

	cr.Start()
	r := chi.NewRouter()

	c := cors.New(cors.Options{
		AllowedOrigins: []string{"http://localhost:3000"},
		AllowedMethods: []string{"GET", "POST", "DELETE", "OPTIONS", "PUT"},
		AllowedHeaders: []string{"Content-Type", "Authorization"},
	})

	handler := c.Handler(r)

	r.Get("/hello", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Hello from Go backend"))
	})

	r.Route("/v1", func(r chi.Router) {
		r.Handle("/quote", SupabaseQuoteEndpoint.QuoteHandler(supabaseQuoteSvc))
		r.Get("/quote/today", SupabaseQuoteEndpoint.SupabaseQuoteHandler(supabaseQuoteSvc))
		r.Get("/quote/all", SupabaseQuoteEndpoint.AllDailyQuotesHandler(supabaseQuoteSvc))
		r.Get("/banner/message", BannerEndpoint.BannerHandler(bannerSvc))
		r.Handle("/news", NewsEndpoint.NewsHandler(newsService))
		r.Handle("/tasks/recommendations", RecommendationsEndpoint.RecommendationsHandler(recommendationsService))

		r.With(helpers.TokenAuthorizer(clients.Auth)).Group(func(r chi.Router) {
			// r.Handle("/news", NewsEndpoint.NewsHandler(newsService))
			r.Get("/users/search", SupabaseUserEndpoint.SearchUsersHandler(supabaseUserSvc))
			r.Post("/user/create", SupabaseUserEndpoint.ProfileHandler(supabaseUserSvc, supabasePhotoSvc))
			r.Post("/user/login", SupabaseLoginEndpoint.LoginHandler(supabaseUserSvc, supabaseQuoteSvc))
			r.Get("/users/{uid}", SupabaseUserEndpoint.UserProfileHandler(supabaseUserSvc))
			r.Put("/users/{uid}/update", SupabaseUserEndpoint.UpdateProfileHandler(supabaseUserSvc, supabasePhotoSvc))
			r.Delete("/user/delete", SupabaseUserEndpoint.DeleteUserHandler(supabaseUserSvc))
			r.Handle("/shines", SupabaseShinesEndpoint.ShineHandler(supabaseShineSvc, supabasePhotoSvc))
			r.Patch("/shines/{shineId}", SupabaseShinesEndpoint.UpdateShineHandler(supabaseShineSvc))
			r.Post("/shines/{shineId}/toggleRay", SupabaseShinesEndpoint.ToggleRayHandler(supabaseShineSvc))
			r.Delete("/shines/{shineId}", SupabaseShinesEndpoint.DeleteShineHandler(supabaseShineSvc))
			r.Handle("/shines/{shineId}/comments", CommentEndpoint.CommentHandler(commentSvc))
			r.Delete("/shines/{shineId}/comments/{commentId}", CommentEndpoint.CommentHandler(commentSvc))
			r.Post("/shines/{shineId}/comments/{parentId}", CommentEndpoint.CommentHandler(commentSvc)) //REPLY CREATER
			r.Put("/shines/{shineId}/comments/{commentId}", CommentEndpoint.CommentHandler(commentSvc))
			r.Handle("/shines/{shineId}/comments/{commentId}/toggleRay", CommentEndpoint.ToggleCommentRayHandler(commentSvc))
			r.Handle("/comments/{commentId}/replies", CommentEndpoint.ReplyHandler(commentSvc))
		})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	server := &http.Server{Addr: ":" + port, Handler: handler}

	go func() {
		log.Printf("Server listening on port %s", port)
		if serveErr := server.ListenAndServe(); serveErr != nil && serveErr != http.ErrServerClosed {
			log.Fatalf("Server failed: %v", serveErr)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer shutdownCancel()
	if shutdownErr := server.Shutdown(shutdownCtx); shutdownErr != nil {
		log.Fatalf("Server shutdown failed: %v", shutdownErr)
	}
	log.Println("Server stopped gracefully.")

	// select {}
}
