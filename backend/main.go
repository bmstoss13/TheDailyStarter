package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	firebaseService "services/firebase"
	quoteService "services/quoteservice"
	QuoteEndpoint "services/quoteservice/endpoint"
	"services/userservice"
	UserEndpoint "services/userservice/endpoint"
	helpers "services/utils"

	"github.com/go-chi/chi/v5"
	"github.com/joho/godotenv"
)

func main() {
	envErr := godotenv.Load()
	if envErr != nil {
		log.Fatalf("Failed to load environment variables")
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

	// Create a new Chi router.
	r := chi.NewRouter()

	// Apply global CORS middleware for all routes.
	r.Use(helpers.CorsMiddleware([]string{
		http.MethodGet,
		http.MethodPost,
		http.MethodDelete,
		http.MethodOptions,
	}))

	// Define a public route.
	r.Get("/hello", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Hello from Go backend"))
	})

	// Grouping related endpoints under a common path
	r.Route("/api", func(r chi.Router) {

		// Public API routes
		r.Route("/", func(r chi.Router) {
			// Public quote endpoints
			r.Get("/quote/today", QuoteEndpoint.QuoteHandler(quoteSvc))
			r.Get("/quotes/all", QuoteEndpoint.AllQuotesHandler(quoteSvc))

			// Public user endpoint
			r.Get("/users/search", UserEndpoint.SearchUsersHandler(userSvc))
		})

		// Private API routes (requires a valid token)
		r.Route("/", func(r chi.Router) {
			// Apply the token authorization middleware to all routes in this group
			r.Use(helpers.TokenAuthorizer(clients.Auth))

			// User profile endpoints
			r.Post("/user/create", UserEndpoint.CreateProfileHandler(userSvc))
			r.Delete("/user/delete", UserEndpoint.DeleteUserHandler(userSvc))
		})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	server := &http.Server{Addr: ":" + port, Handler: r} // Use the chi router

	// ... rest of your graceful shutdown logic remains the same
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
