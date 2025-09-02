package CommentEndpoint

import (
	"encoding/json"
	"log"
	"net/http"
	"services/supabase/commentservice"
	sharedCtx "services/utils/context"
	"strconv"

	"github.com/go-chi/chi/v5"
)

type commentRequest struct {
	Text string `json:"text"`
}

type updateCommentRequest struct {
	Text string `json:"text"`
}

func CommentHandler(commentSvc *commentservice.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		uid, ok := r.Context().Value(sharedCtx.UIDKey).(string)
		if !ok || uid == "" {
			log.Printf("CommentHandler: Unauthorized request, UID not found in context.")
			http.Error(w, "Unauthorized.", http.StatusUnauthorized)
			return
		}

		shineId := chi.URLParam(r, "shineId")
		if shineId == "" {
			log.Printf("CommentHandler: Unauthorized request, shine id not found in context.")
			http.Error(w, "Unauthorized.", http.StatusUnauthorized)
			return
		}

		switch r.Method {
		case http.MethodPost:
			handlePostComment(w, r, uid, commentSvc, shineId)
		case http.MethodGet:
			handleGetComments(w, r, uid, commentSvc, shineId)
		case http.MethodDelete:
			handleDeleteComment(w, r, uid, commentSvc)
		case http.MethodPut:
			handleUpdateComment(w, r, uid, commentSvc)
		case http.MethodPatch:
			handleToggleCommentRay(w, r, uid, commentSvc)
		default:
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		}
	}
}

func handleGetComments(w http.ResponseWriter, r *http.Request, uid string, commentSvc *commentservice.Service, shineId string) {
	limitStr := r.URL.Query().Get("limit")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 10
	}

	startAfterCommentId := r.URL.Query().Get("startAfter")

	comments, err := commentSvc.GetComments(r.Context(), limit, startAfterCommentId, uid, shineId)
	if err != nil {
		log.Printf("Failed to get comments: %v", err)
		http.Error(w, "Failed to get comments", http.StatusInternalServerError)
		return
	}

	if comments == nil {
		comments = []commentservice.CommentsWithRayData{}
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(&comments); err != nil {
		log.Printf("Failed to encode comments response: %v", err)
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}

func handlePostComment(w http.ResponseWriter, r *http.Request, uid string, commentSvc *commentservice.Service, shineId string) {
	var req commentRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("Failed to decode request body: %v", err)
		http.Error(w, "Bad request body", http.StatusBadRequest)
		return
	}

	createdComment, err := commentSvc.CreateComment(r.Context(), uid, shineId, req.Text)
	if err != nil {
		log.Printf("Failed to create comment: %v", err)
		http.Error(w, "Failed to create shine", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	if err := json.NewEncoder(w).Encode(&createdComment); err != nil {
		log.Printf("Failed to encode created comment response: %v", err)
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}

func handleDeleteComment(w http.ResponseWriter, r *http.Request, uid string, commentSvc *commentservice.Service) {
	commentId := chi.URLParam(r, "commentId") //requires commentId
	if commentId == "" {
		log.Printf("Comment ID is not given in url param.")
		http.Error(w, "Comment ID is required", http.StatusBadRequest)
		return
	}

	err := commentSvc.DeleteComment(r.Context(), uid, commentId, "")
	if err != nil {
		log.Printf("Failed to delete comment, %v: %v", commentId, err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func handleUpdateComment(w http.ResponseWriter, r *http.Request, uid string, commentSvc *commentservice.Service) {
	commentId := chi.URLParam(r, "commentId")
	if commentId == "" {
		log.Printf("Comment ID is not given in url param.")
		http.Error(w, "Comment ID is required", http.StatusBadRequest)
		return
	}

	var req updateCommentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("Failed to decode request body: %v", err)
		http.Error(w, "Bad Request Body", http.StatusBadRequest)
		return
	}

	updates := map[string]interface{}{"text:": req.Text}

	err := commentSvc.UpdateComment(r.Context(), uid, commentId, updates)
	if err != nil {
		log.Printf("Failed to update comment, %v: %v", commentId, err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func handleToggleCommentRay(w http.ResponseWriter, r *http.Request, uid string, commentSvc *commentservice.Service) {
	commentId := chi.URLParam(r, "commentId")
	if commentId == "" {
		log.Printf("failed to retrieve comment id from url params")
		http.Error(w, "Comment ID is required", http.StatusBadRequest)
		return
	}

	rayAdded, err := commentSvc.ToggleCommentRay(r.Context(), uid, commentId)
	if err != nil {
		log.Printf("an error occurred while toggling ray for comment, %v: %v", commentId, err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(map[string]bool{"rayAdded": rayAdded}); err != nil {
		log.Printf("an error occurred while encoding toggled ray: %v", err)
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}

// package CommentEndpoint

// import (
// 	"encoding/json"
// 	"log"
// 	"net/http"
// 	"services/supabase/commentservice"
// 	sharedCtx "services/utils/context"
// 	"strconv"

// 	"github.com/go-chi/chi/v5"
// )

// type commentRequest struct {
// 	Text string `json:"text"`
// }

// type updateCommentRequest struct {
// 	Text string `json:"text"`
// }

// func CommentHandler(commentSvc *commentservice.Service) http.HandlerFunc {
// 	return func(w http.ResponseWriter, r *http.Request) {
// 		uid, ok := r.Context().Value(sharedCtx.UIDKey).(string)
// 		if !ok || uid == "" {
// 			log.Printf("CommentHandler: Unauthorized request, UID not found in context.")
// 			http.Error(w, "Unauthorized.", http.StatusUnauthorized)
// 			return
// 		}

// 		// Note: Getting shineId from context implies it's set by a middleware
// 		shineId, ok := r.Context().Value("shineId").(string)
// 		if !ok || shineId == "" {
// 			log.Printf("CommentHandler: Unauthorized request, shine id not found in context.")
// 			http.Error(w, "Unauthorized.", http.StatusUnauthorized)
// 			return
// 		}

// 		switch r.Method {
// 		case http.MethodPost:
// 			handlePostComment(w, r, uid, commentSvc, shineId)
// 		case http.MethodGet:
// 			handleGetComments(w, r, uid, commentSvc, shineId)
// 		case http.MethodDelete:
// 			handleDeleteComment(w, r, uid, commentSvc)
// 		case http.MethodPut:
// 			handleUpdateComment(w, r, uid, commentSvc)
// 		case http.MethodPatch:
// 			handleToggleCommentRay(w, r, uid, commentSvc)
// 		default:
// 			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
// 		}
// 	}
// }

// func handleGetComments(w http.ResponseWriter, r *http.Request, uid string, commentSvc *commentservice.Service, shineId string) {
// 	limitStr := r.URL.Query().Get("limit")
// 	limit, err := strconv.Atoi(limitStr)
// 	if err != nil || limit <= 0 {
// 		limit = 10
// 	}

// 	startAfterCommentId := r.URL.Query().Get("startAfter")

// 	comments, err := commentSvc.GetComments(r.Context(), limit, startAfterCommentId, uid, shineId)
// 	if err != nil {
// 		log.Printf("Failed to get comments: %v", err)
// 		http.Error(w, "Failed to get comments", http.StatusInternalServerError)
// 		return
// 	}

// 	if comments == nil {
// 		comments = []commentservice.CommentsWithRayData{}
// 	}

// 	w.Header().Set("Content-Type", "application/json")
// 	if err := json.NewEncoder(w).Encode(&comments); err != nil {
// 		log.Printf("Failed to encode comments response: %v", err)
// 		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
// 		return
// 	}
// }

// func handlePostComment(w http.ResponseWriter, r *http.Request, uid string, commentSvc *commentservice.Service, shineId string) {
// 	var req commentRequest
// 	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
// 		log.Printf("Failed to decode request body: %v", err)
// 		http.Error(w, "Bad request body", http.StatusBadRequest)
// 		return
// 	}

// 	createdComment, err := commentSvc.CreateComment(r.Context(), uid, shineId, req.Text)
// 	if err != nil {
// 		log.Printf("Failed to create comment: %v", err)
// 		http.Error(w, "Failed to create shine", http.StatusInternalServerError)
// 		return
// 	}

// 	w.Header().Set("Content-Type", "application/json")
// 	w.WriteHeader(http.StatusCreated)
// 	if err := json.NewEncoder(w).Encode(&createdComment); err != nil {
// 		log.Printf("Failed to encode created comment response: %v", err)
// 		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
// 		return
// 	}
// }

// func handleDeleteComment(w http.ResponseWriter, r *http.Request, uid string, commentSvc *commentservice.Service) {
// 	commentId := chi.URLParam(r, "commentId")
// 	if commentId == "" {
// 		http.Error(w, "Comment ID is required", http.StatusBadRequest)
// 		return
// 	}

// 	err := commentSvc.DeleteComment(r.Context(), uid, commentId, "")
// 	if err != nil {
// 		http.Error(w, "Failed to delete comment", http.StatusInternalServerError)
// 		return
// 	}

// 	w.WriteHeader(http.StatusNoContent)
// }

// func handleUpdateComment(w http.ResponseWriter, r *http.Request, uid string, commentSvc *commentservice.Service) {
// 	commentId := chi.URLParam(r, "commentId")
// 	if commentId == "" {
// 		http.Error(w, "Comment ID is required", http.StatusBadRequest)
// 		return
// 	}

// 	var req updateCommentRequest
// 	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
// 		log.Printf("Failed to decode request body: %v", err)
// 		http.Error(w, "Bad request body", http.StatusBadRequest)
// 		return
// 	}

// 	updates := map[string]interface{}{"text": req.Text}
// 	err := commentSvc.UpdateComment(r.Context(), uid, commentId, updates)
// 	if err != nil {
// 		http.Error(w, "Failed to update comment", http.StatusInternalServerError)
// 		return
// 	}

// 	w.WriteHeader(http.StatusOK)
// }

// func handleToggleCommentRay(w http.ResponseWriter, r *http.Request, uid string, commentSvc *commentservice.Service) {
// 	commentId := chi.URLParam(r, "commentId")
// 	if commentId == "" {
// 		http.Error(w, "Comment ID is required", http.StatusBadRequest)
// 		return
// 	}

// 	rayAdded, err := commentSvc.ToggleCommentRay(r.Context(), uid, commentId)
// 	if err != nil {
// 		http.Error(w, "Failed to toggle ray on comment", http.StatusInternalServerError)
// 		return
// 	}

// 	w.Header().Set("Content-Type", "application/json")
// 	if err := json.NewEncoder(w).Encode(map[string]bool{"rayAdded": rayAdded}); err != nil {
// 		log.Printf("Failed to encode ray toggle response: %v", err)
// 		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
// 		return
// 	}
// }
