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
	LoginEndpoint "services/loginservice/enpdoint"
	"services/photoservice"
	quoteService "services/quoteservice"
	QuoteEndpoint "services/quoteservice/endpoint"
	"services/shineservice"
	ShinesEndpoint "services/shineservice/endpoint"
	"services/userservice"
	UserEndpoint "services/userservice/endpoint"
	helpers "services/utils"

	"github.com/go-chi/chi/v5"
	"github.com/joho/godotenv"
	"github.com/rs/cors"

	SupabaseLoginEndpoint "services/supabase/loginservice/endpoint"
	SupabasePhotos "services/supabase/photoservice"
	SupabaseQuotes "services/supabase/quoteservice"
	SupabaseQuoteEndpoint "services/supabase/quoteservice/endpoint"
	SupabaseShines "services/supabase/shineservice"
	SupabaseShinesEndpoint "services/supabase/shineservice/endpoint"
	SupabaseUsers "services/supabase/userservice"
	SupabaseUserEndpoint "services/supabase/userservice/endpoint"
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

	quoteSvc := quoteService.NewService(clients)
	userSvc := userservice.NewService(clients)
	shineSvc := shineservice.NewService(clients, userSvc)
	photoSvc := photoservice.NewService(clients.Firestore, clients.Storage)

	supabaseQuoteSvc := SupabaseQuotes.NewSupabaseService(clients.DB)
	supabaseUserSvc := SupabaseUsers.NewSupabaseService(clients.DB, clients)
	supabasePhotoSvc := SupabasePhotos.NewSupabaseService(clients.DB, clients.Storage)
	supabaseShineSvc := SupabaseShines.NewService(clients.DB, supabaseUserSvc)
	bannerSvc := BannerService.NewService(supabaseUserSvc)

	r := chi.NewRouter()

	c := cors.New(cors.Options{
		AllowedOrigins: []string{"http://localhost:3000"},
		AllowedMethods: []string{"GET", "POST", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"Content-Type", "Authorization"},
	})

	handler := c.Handler(r)

	r.Get("/hello", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Hello from Go backend"))
	})

	r.Route("/v1", func(r chi.Router) {
		r.Get("/quote/today", SupabaseQuoteEndpoint.SupabaseQuoteHandler(supabaseQuoteSvc))
		r.Get("/quotes/all", SupabaseQuoteEndpoint.AllDailyQuotesHandler(supabaseQuoteSvc))
		r.Get("/banner/message", BannerEndpoint.BannerHandler(bannerSvc))

		r.With(helpers.TokenAuthorizer(clients.Auth)).Group(func(r chi.Router) {
			r.Get("/users/search", SupabaseUserEndpoint.SearchUsersHandler(supabaseUserSvc))
			r.Post("/user/create", SupabaseUserEndpoint.ProfileHandler(supabaseUserSvc, supabasePhotoSvc))
			r.Post("/user/login", SupabaseLoginEndpoint.LoginHandler(supabaseUserSvc, supabaseQuoteSvc))
			r.Get("/users/{uid}", SupabaseUserEndpoint.UserProfileHandler(supabaseUserSvc))
			r.Delete("/user/delete", SupabaseUserEndpoint.DeleteUserHandler(supabaseUserSvc))
			r.Handle("/shines", SupabaseShinesEndpoint.ShineHandler(supabaseShineSvc, supabasePhotoSvc))
			r.Patch("/shines/{shineId}", SupabaseShinesEndpoint.UpdateShineHandler(supabaseShineSvc))
			r.Post("/shines/{shineId}/toggleRay", SupabaseShinesEndpoint.ToggleRayHandler(supabaseShineSvc))
			r.Delete("/shines/{shineId}", SupabaseShinesEndpoint.DeleteShineHandler(supabaseShineSvc))
		})
	})

	r.Route("/api", func(r chi.Router) {
		r.Get("/quote/today", QuoteEndpoint.QuoteHandler(quoteSvc))
		r.Get("/quotes/all", QuoteEndpoint.AllQuotesHandler(quoteSvc))
		r.Get("/users/search", UserEndpoint.SearchUsersHandler(userSvc))
		r.Post("/user/create", UserEndpoint.CreateProfileHandler(userSvc, photoSvc))

		r.With(helpers.TokenAuthorizer(clients.Auth)).Group(func(r chi.Router) {
			r.Post("/user/login", LoginEndpoint.LoginFlowHandler(userSvc, quoteSvc))
			r.Delete("/user/delete", UserEndpoint.DeleteUserHandler(userSvc))
			r.Get("/users/{uid}", UserEndpoint.UserProfileHandler(userSvc))
			r.Handle("/shines", ShinesEndpoint.ShineHandler(shineSvc))
			r.Delete("/shines/{shineId}", ShinesEndpoint.DeleteShineHandler(shineSvc))
			r.Patch("/shines/{shineId}", ShinesEndpoint.UpdateShineHandler(shineSvc))
			r.Post("/shines/{shineId}/toggleRay", ShinesEndpoint.ToggleRayHandler(shineSvc))
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
}
