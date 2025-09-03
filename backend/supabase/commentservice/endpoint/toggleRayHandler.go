package CommentEndpoint

import (
	"encoding/json"
	"log"
	"net/http"
	"services/supabase/commentservice"
	sharedCtx "services/utils/context"

	"github.com/go-chi/chi/v5"
)

func ToggleCommentRayHandler(commentSvc *commentservice.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		uid, ok := r.Context().Value(sharedCtx.UIDKey).(string)
		if !ok || uid == "" {
			log.Printf("ToggleCommentRayHandler: Unauthorized request, UID not found in context.")
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		shineId := chi.URLParam(r, "shineId")
		if shineId == "" {
			log.Printf("ToggleCommentRayHandler: Unauthorized request, shine id not found in context.")
			http.Error(w, "Unauthorized.", http.StatusUnauthorized)
			return
		}

		commentId := chi.URLParam(r, "commentId")
		if commentId == "" {
			log.Printf("ToggleCommentRayHandler: Unauthorized request, comment id not found in context.")
			http.Error(w, "Unauthorized.", http.StatusUnauthorized)
			return
		}

		rayToggled, err := commentSvc.ToggleCommentRay(r.Context(), uid, commentId)
		if err != nil {
			log.Printf("API Error: Failed to toggle ray for comment %s by user %s: %v", commentId, uid, err)
			if err.Error() == "comment does not exist" {
				http.Error(w, "Comment not found", http.StatusNotFound)
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
