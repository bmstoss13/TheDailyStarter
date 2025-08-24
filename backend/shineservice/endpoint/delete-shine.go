package ShinesEndpoint

import (
	"log"
	"net/http"

	"services/shineservice"

	"github.com/go-chi/chi/v5"
)

func DeleteShineHandler(shineSvc *shineservice.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodDelete {
			log.Print("Method not allowed for delete shine handler.")
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
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		if err := shineSvc.DeleteShine(r.Context(), uid, shineId); err != nil {
			if err.Error() == "shine not found" {
				http.Error(w, "Shine not found", http.StatusNotFound)
			} else if err.Error() == "unauthorized to delete this shine" {
				http.Error(w, "Unauthorized", http.StatusForbidden)
			} else {
				log.Printf("Failed to delete shine %s: %v", shineId, err)
				http.Error(w, "Failed to delete shine", http.StatusInternalServerError)
			}
			return
		}

		w.WriteHeader(http.StatusOK)
	}
}
