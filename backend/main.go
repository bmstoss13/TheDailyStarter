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
	LoginEndpoint "services/loginservice/enpdoint"
	quoteService "services/quoteservice"
	QuoteEndpoint "services/quoteservice/endpoint"
	"services/shineservice"
	ShinesEndpoint "services/shineservice/endpoint"
	"services/userservice"
	UserEndpoint "services/userservice/endpoint"
	helpers "services/utils" // You will still need the TokenAuthorizer from here

	"github.com/go-chi/chi/v5"
	"github.com/joho/godotenv"
	"github.com/rs/cors" // Import the cors library
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
	shineSvc := shineservice.NewService(clients, userSvc)

	r := chi.NewRouter()

	// Configure the CORS middleware from the external library
	c := cors.New(cors.Options{
		AllowedOrigins: []string{"http://localhost:3000"}, // Allow your Next.js app
		AllowedMethods: []string{"GET", "POST", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"Content-Type", "Authorization"},
	})

	// Wrap your router with the CORS middleware
	handler := c.Handler(r)

	// Define your routes on the router 'r'
	r.Get("/hello", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Hello from Go backend"))
	})

	r.Route("/api", func(r chi.Router) {
		r.Get("/quote/today", QuoteEndpoint.QuoteHandler(quoteSvc))
		r.Get("/quotes/all", QuoteEndpoint.AllQuotesHandler(quoteSvc))
		r.Get("/users/search", UserEndpoint.SearchUsersHandler(userSvc))
		r.Post("/user/create", UserEndpoint.CreateProfileHandler(userSvc))

		r.With(helpers.TokenAuthorizer(clients.Auth)).Group(func(r chi.Router) {
			r.Post("/user/login", LoginEndpoint.LoginFlowHandler(userSvc, quoteSvc))
			r.Delete("/user/delete", UserEndpoint.DeleteUserHandler(userSvc))

			//endpoint for GET and POST shines
			r.Handle("/shines", ShinesEndpoint.ShineHandler(shineSvc))

			//endpoint to delete shine
			r.Delete("/shines/{shineId}", ShinesEndpoint.DeleteShineHandler(shineSvc))

			r.Patch("/shines/{shineId}", ShinesEndpoint.UpdateShineHandler(shineSvc))

			//SMACK that like button.
			r.Post("/shines/{shineId}", ShinesEndpoint.ToggleRayHandler(shineSvc))
		})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Use the wrapped handler instead of the raw router
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
