package SupabaseUserEndpoint

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	SupabaseUsers "services/supabase/userservice"
	"time"

	"github.com/go-chi/chi/v5"
	// "github.com/go-chi/render"
)

// handler for retrieving all profiles from firebase. Returns handler function.
func GetAllProfilesHandler(svc *SupabaseUsers.SupabaseService) http.HandlerFunc {
	//actual handler function
	return func(w http.ResponseWriter, r *http.Request) {
		//has to be get method
		if r.Method != http.MethodGet {
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
			return
		}

		uid := chi.URLParam(r, "uid")
		if uid == "" {
			http.Error(w, "User ID required.", http.StatusBadRequest)
			return
		}

		//set timeout to get context
		ctx, cancel := context.WithTimeout(r.Context(), 15*time.Second)
		defer cancel()

		users, err := svc.GetAllUserProfilesSupabase(ctx, uid)
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
