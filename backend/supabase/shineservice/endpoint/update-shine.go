package SupabaseShinesEndpoint

import (
	"encoding/json"
	"net/http"
	SupabaseShines "services/supabase/shineservice"

	"github.com/go-chi/chi/v5"
)

type updateShineRequest struct {
	Text     string `json:"text,omitempty"`
	MediaURL string `json:"mediaURL,omitempty"`
}

func UpdateShineHandler(shineSvc *SupabaseShines.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		if r.Method != http.MethodPatch {
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
			return
		}

		shineId := chi.URLParam(r, "shineId")
		if shineId == "" {
			http.Error(w, "Shine ID is required", http.StatusBadRequest)
			return
		}

		uid, ok := r.Context().Value("uid").(string)
		if !ok || uid == "" {
			http.Error(w, "Unauthorized access. User ID required.", http.StatusUnauthorized)
			return
		}

		var reqBody updateShineRequest
		if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		updates := make(map[string]interface{})
		if reqBody.Text != "" {
			updates["text"] = reqBody.Text
		}
		if reqBody.MediaURL != "" {
			updates["mediaURL"] = reqBody.MediaURL
		}

		if err := shineSvc.UpdateShine(r.Context(), uid, shineId, updates); err != nil {
			if err.Error() == "shine not found" {
				http.Error(w, "Shine not found", http.StatusNotFound)
			} else if err.Error() == "unauthorized to update this shine" {
				http.Error(w, "Unauthorized", http.StatusForbidden)
			} else {
				http.Error(w, "Failed to update shine", http.StatusInternalServerError)
			}
			return
		}

		w.WriteHeader(http.StatusOK)
	}
}
