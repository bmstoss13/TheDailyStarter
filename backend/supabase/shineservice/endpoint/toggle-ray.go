package SupabaseShinesEndpoint

import (
	"encoding/json"
	"log"
	"net/http"
	SupabaseShines "services/supabase/shineservice"

	sharedCtx "services/utils/context"

	"github.com/go-chi/chi/v5"
)

func ToggleRayHandler(shineSvc *SupabaseShines.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
			return
		}

		shineId := chi.URLParam(r, "shineId")
		if shineId == "" {
			http.Error(w, "Shine ID is required", http.StatusBadRequest)
			return
		}

		uid, ok := r.Context().Value(sharedCtx.UIDKey).(string)
		if !ok || uid == "" {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		rayToggled, err := shineSvc.ToggleRay(r.Context(), uid, shineId)
		if err != nil {
			log.Printf("API Error: Failed to toggle ray for shine %s by user %s: %v", shineId, uid, err)
			if err.Error() == "shine post does not exist" {
				http.Error(w, "Shine not found", http.StatusNotFound)
				return
			}
			http.Error(w, "Failed to process request", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		if err := json.NewEncoder(w).Encode(rayToggled); err != nil {
			log.Printf("API Error: Failed to encode response: %v", err)
			http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		}
	}
}
