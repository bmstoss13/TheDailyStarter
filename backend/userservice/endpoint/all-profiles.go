package UserEndpoint

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"services/userservice"
	"time"
)

// handler for retrieving all profiles from firebase. Returns handler function.
func GetAllProfilesHandler(svc *userservice.Service) http.HandlerFunc {
	//actual handler function
	return func(w http.ResponseWriter, r *http.Request) {
		//has to be get method
		if r.Method != http.MethodGet {
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
			return
		}

		//set timeout to get context
		ctx, cancel := context.WithTimeout(r.Context(), 15*time.Second)
		defer cancel()

		users, err := svc.GetAllUserProfiles(ctx)
		if err != nil {
			log.Printf("error fetching all users: %v", err)
			http.Error(w, "error fetching all users", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(users); err != nil {
			log.Printf("Error encoding response: %v", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
	}
}
