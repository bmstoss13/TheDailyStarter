package UserEndpoint

import (
	"encoding/json"
	"log"
	"net/http"
	"services/userservice"
)

func CreateProfileHandler(svc *userservice.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
			return
		}

		uid, ok := r.Context().Value("uid").(string)
		if !ok || uid == "" {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
		}

		var profileData userservice.UserProfileData
		if err := json.NewDecoder(r.Body).Decode(&profileData); err != nil {
			log.Printf("Error decoding request body: %v", err)
			http.Error(w, "Bad Request", http.StatusBadRequest)
		}

		createdProfile, err := svc.CreateUserProfile(r.Context(), uid, profileData)
		if err != nil {
			log.Printf("Error creating user profile: %v", err)
			http.Error(w, "Failed to create user profile", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(createdProfile); err != nil {
			log.Printf("Error encoding response: %v", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
	}
}
