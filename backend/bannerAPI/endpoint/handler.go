package BannerEndpoint

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	BannerService "services/bannerAPI"
	"time"
)

func BannerHandler(svc *BannerService.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			log.Printf("Method not allowed: %v", r.Method)
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
			return
		}

		ctx, cancel := context.WithTimeout(r.Context(), 15*time.Second)
		defer cancel()

		message, err := svc.GetBannerMessage(ctx)
		if err != nil {
			log.Printf("error fetching banner message: %v", err)
			http.Error(w, "error fetching banner message", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(message); err != nil {
			log.Printf("Error encoding response: %v", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

	}
}
