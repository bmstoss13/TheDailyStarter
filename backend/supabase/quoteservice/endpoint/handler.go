package SupabaseQuoteEndpoint

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	SupabaseQuotes "services/supabase/quoteservice"
	"time"
)

func QuoteHandler(quoteSvc *SupabaseQuotes.SupabaseService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPut:
			handleUpdateDailyQuote(w, r, quoteSvc)
		case http.MethodGet:
			handleGetDailyQuote(w, r, quoteSvc)
		default:
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		}
	}
}

// Handler helper to PUT a new quote in the db/cache
func handleUpdateDailyQuote(w http.ResponseWriter, r *http.Request, quoteSvc *SupabaseQuotes.SupabaseService) {

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	if err := quoteSvc.UpdateAndStoreDailyQuote(ctx); err != nil {
		log.Printf("error updating daily quote: %s", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	log.Printf("Daily quote successfully stored in db/cache")
}

// Handler helper to GET a new quote from the db/cache
func handleGetDailyQuote(w http.ResponseWriter, r *http.Request, quoteSvc *SupabaseQuotes.SupabaseService) {

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	quoteData, err := quoteSvc.GetDailyQuoteFromCache(ctx)
	if err != nil {
		log.Printf("error fetching quote from redis cache/supabase: %s", err)
		http.Error(w, "failed to get quote data", http.StatusInternalServerError)
		return
	}

	if quoteData == nil {
		log.Printf("daily quote not found")
		http.Error(w, "Not Found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(&quoteData); err != nil {
		log.Printf("Failed to encode quote data response: %v", err)
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}
