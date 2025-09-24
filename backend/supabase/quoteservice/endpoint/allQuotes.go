package SupabaseQuoteEndpoint

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	SupabaseQuotes "services/supabase/quoteservice"
	"time"
)

func AllDailyQuotesHandler(svc *SupabaseQuotes.SupabaseService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
			return
		}

		ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
		defer cancel()

		quotes, err := svc.GetAllQuotesSupabase(ctx)
		if err != nil {
			log.Printf("error fetching all quotes: %s", err)
			http.Error(w, "error fetching all quotes", http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(quotes); err != nil {
			log.Printf("Error encoding response: %v", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
	}
}
