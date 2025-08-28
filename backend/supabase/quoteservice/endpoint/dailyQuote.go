package SupabaseQuoteEndpoint

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	SupabaseQuotes "services/supabase/quoteservice"
	"time"
)

func SupabaseQuoteHandler(svc *SupabaseQuotes.SupabaseService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
			return
		}

		ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
		defer cancel()

		quote, err := svc.GetOrCreateDailyQuote(ctx)
		if err != nil {
			log.Printf("Error fetching or creating daily quote: %v", err)
			http.Error(w, "Failed to fetch daily quote", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(quote); err != nil {
			log.Printf("Error encoding response: %v", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
	}
}
