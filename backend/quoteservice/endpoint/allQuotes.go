package QuoteEndpoint

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"services/quoteservice"
	"time"
)

func AllQuotesHandler(svc *quoteservice.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
			return
		}

		ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
		defer cancel()

		quotes, err := svc.GetAllDailyQuotes(ctx)
		if err != nil {
			log.Printf("error fetching all quotee: %v", err)
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
