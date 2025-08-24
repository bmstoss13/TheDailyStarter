package QuoteEndpoint

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"services/quoteservice"
	"time"
)

// handler to fetch all zen quotes from firebase database. Returns handler function.
func AllQuotesHandler(svc *quoteservice.Service) http.HandlerFunc {
	//actual function handler
	return func(w http.ResponseWriter, r *http.Request) {
		//http method has to be get
		if r.Method != http.MethodGet {
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
			return
		}

		//set timeout for getting context
		ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
		defer cancel()

		//call helper function from dailyservice
		quotes, err := svc.GetAllDailyQuotes(ctx)
		if err != nil {
			log.Printf("error fetching all quotee: %v", err)
			http.Error(w, "error fetching all quotes", http.StatusInternalServerError)
			return
		}

		//Encode the result into json
		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(quotes); err != nil {
			log.Printf("Error encoding response: %v", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

	}
}
