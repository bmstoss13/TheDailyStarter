package SupabaseUserEndpoint

import (
	"log"
	"net/http"
	SupabaseUsers "services/supabase/userservice"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
)

func UserProfileHandler(svc *SupabaseUsers.SupabaseService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
			return
		}

		uid := chi.URLParam(r, "uid")
		if uid == "" {
			http.Error(w, "User ID required.", http.StatusBadRequest)
			return
		}

		user, err := svc.GetUserProfileSupabase(r.Context(), uid)
		if err != nil {
			log.Printf("An error occurred while fetching user profile: %v", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

		render.JSON(w, r, user)
	}
}
