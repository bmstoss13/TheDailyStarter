package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	firebaseService "services/firebase"
	quoteService "services/quoteservice"
	QuoteEndpoint "services/quoteservice/endpoint"
	"syscall"
	"time"

	"github.com/joho/godotenv"
)

func main() {

	chosenPort := "PORT"

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

	defer func() {
		if closeErr := clients.Close(); closeErr != nil {
			log.Printf("Error closing firebase client: %v", err)
		}
	}()

	quoteSvc := quoteService.NewService(clients)

	http.HandleFunc("/hello", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Hello from Go backend"))
	})

	http.HandleFunc("/api/quote", QuoteEndpoint.QuoteHandler(quoteSvc))

	http.HandleFunc("/api/all-quotes", QuoteEndpoint.AllQuotesHandler(quoteSvc))

	port := os.Getenv(chosenPort)
	if port == "" {
		port = "8080"
	}
	server := &http.Server{Addr: ":" + port}

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
