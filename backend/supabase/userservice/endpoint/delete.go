package SupabaseUserEndpoint

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	SupabaseUsers "services/supabase/userservice"
)

type DeleteUserRequest struct {
	UID string `json:"uid"`
}

func DeleteUserHandler(svc *SupabaseUsers.SupabaseService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodDelete {
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		}

		uid, ok := r.Context().Value("uid").(string)
		if !ok || uid == "" {
			http.Error(w, "Unauthorized.", http.StatusUnauthorized)
		}

		isAdmin, _ := r.Context().Value("isAdmin").(bool)

		var reqBody DeleteUserRequest
		if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
			log.Printf("Error decoding request body: %v", err)
			http.Error(w, "Bad Request.", http.StatusBadRequest)
			return
		}

		if reqBody.UID == "" {
			http.Error(w, "Missing uid", http.StatusBadRequest)
		}

		if !isAdmin && uid != reqBody.UID {
			http.Error(w, "Permision denied.", http.StatusForbidden)
			return
		}

		if err := svc.DeleteUserProfileSupabase(r.Context(), reqBody.UID); err != nil {
			log.Printf("An error occurred while attempting to delete this account: %v", err)
			http.Error(w, "Error while deleting account.", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `{"message": "User %s deleted successfully}`, uid)
	}
}
