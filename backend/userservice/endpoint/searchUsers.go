package UserEndpoint

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"services/userservice"
	"strings"
	"time"
)

func SearchUsersHandler(svc *userservice.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
			return
		}

		query := r.URL.Query().Get("q")

		if strings.TrimSpace(query) == "" {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			w.Write([]byte("[]"))
			return
		}

		ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
		defer cancel()

		searchResults, err := svc.GetSearchedUsersCapped(ctx, query)
		if err != nil {
			log.Printf("Error searching users: %v", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(searchResults); err != nil {
			log.Printf("Error encoding response: %v", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
	}
}
