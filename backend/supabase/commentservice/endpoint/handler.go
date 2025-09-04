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
	Text     string  `json:"text"`
	ParentId *string `json:"parentId,omitempty"`
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

func ReplyHandler(commentSvc *commentservice.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		uid, ok := r.Context().Value(sharedCtx.UIDKey).(string)
		if !ok || uid == "" {
			log.Printf("ReplyHandler: Unauthorized request. UID not found in context.")
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		parentId := chi.URLParam(r, "commentId")
		if parentId == "" {
			log.Printf("ReplyHandler: Parent comment ID not found in URL.")
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		switch r.Method {
		case http.MethodGet:
			handleGetReplies(w, r, uid, commentSvc, parentId)
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

func handleGetReplies(w http.ResponseWriter, r *http.Request, uid string, commentSvc *commentservice.Service, parentId string) {
	limitStr := r.URL.Query().Get("limit")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 10
	}

	startAfterId := r.URL.Query().Get("startAfter")

	replies, err := commentSvc.GetReplies(r.Context(), limit, startAfterId, uid, parentId)
	if err != nil {
		log.Printf("Failed to get replies: %v", err)
		http.Error(w, "Failed to get replies", http.StatusInternalServerError)
		return
	}

	if replies == nil {
		replies = []commentservice.CommentsWithRayData{}
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(&replies); err != nil {
		log.Printf("an error occurred while marshaling reply json data: %v", err)
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
	}
}

func handlePostComment(w http.ResponseWriter, r *http.Request, uid string, commentSvc *commentservice.Service, shineId string) {
	var req commentRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("Failed to decode request body: %v", err)
		http.Error(w, "Bad request body", http.StatusBadRequest)
		return
	}

	parentIdStr := chi.URLParam(r, "parentId")
	var parentIdUrl *string
	if parentIdStr != "" {
		parentIdUrl = &parentIdStr
	}
	log.Printf("Parent ID: %v", req.ParentId)

	createdComment, err := commentSvc.CreateComment(r.Context(), uid, shineId, req.Text, parentIdUrl)
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

	updates := map[string]interface{}{"text": req.Text}

	updatedComment, err := commentSvc.UpdateComment(r.Context(), uid, commentId, updates)
	if err != nil {
		log.Printf("Failed to update comment, %v: %v", commentId, err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(updatedComment); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
	}
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
