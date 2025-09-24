package newsendpoint

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"services/supabase/newsservice"
	"time"
)

// Combined news handler to get the daily news
func NewsHandler(svc *newsservice.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPut:
			handleUpdateDailyNews(w, r, svc)
		case http.MethodGet:
			handleGetDailyNews(w, r, svc)
		default:
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		}
	}
}

// Handler helper to PUT a new set of daily news in the db/cache
func handleUpdateDailyNews(w http.ResponseWriter, r *http.Request, newsSvc *newsservice.Service) {

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	// Update the daily news with new stories
	if err := newsSvc.UpdateDailyNews(ctx, 5, 0.9); err != nil {
		log.Printf("error updating daily news stories: %s", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
}

// Handler helper to GET the daily news from the db/cache
func handleGetDailyNews(w http.ResponseWriter, r *http.Request, newsSvc *newsservice.Service) {

	// Get news from cache or supabase and fill cache
	newsData, err := newsSvc.GetDailyNewsFromSupabase(r.Context())
	if err != nil {
		log.Printf("error fetching news from redis cache/supabase db: %v", err)
		http.Error(w, "failed to get news data", http.StatusInternalServerError)
		return
	}

	// Set news data to an empty array
	if newsData == nil {
		newsData = []newsservice.NewsData{}
	}

	// Write news data to response
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(&newsData); err != nil {
		log.Printf("Failed to encode news data response: %v", err)
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}
