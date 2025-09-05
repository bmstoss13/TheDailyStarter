package SupabaseUserEndpoint

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	SupabasePhotos "services/supabase/photoservice"
	SupabaseUsers "services/supabase/userservice"
	sharedCtx "services/utils/context"
)

// type contextKey string

// const (
// 	UIDKey   contextKey = "uid"
// 	EmailKey contextKey = "email"
// )

func ProfileHandler(svc *SupabaseUsers.SupabaseService, photoSvc *SupabasePhotos.SupabaseService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		}

		uid, ok := r.Context().Value(sharedCtx.UIDKey).(string)
		if !ok || uid == "" {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		email, ok := r.Context().Value(sharedCtx.EmailKey).(string)
		if !ok || email == "" {
			log.Println("Warning: Email not found in context for user:", uid)
			email = ""
		}

		err := r.ParseMultipartForm(10 << 20)
		if err != nil {
			log.Printf("Error parsing multipart form: %v", err)
			http.Error(w, "Bad Request", http.StatusBadRequest)
			return
		}

		profileData := SupabaseUsers.UserProfileData{
			FirstName:      r.FormValue("firstName"),
			LastName:       r.FormValue("lastName"),
			DOB:            r.FormValue("dob"),
			Username:       r.FormValue("username"),
			Email:          email,
			Bio:            r.FormValue("bio"),
			Pronouns:       SupabaseUsers.PronounCategory(r.FormValue("pronounCategory")),
			CustomPronouns: r.FormValue("customPronouns"),
		}

		var photoURL string
		file, handler, err := r.FormFile("file")
		if err != nil {
			if err != http.ErrMissingFile {
				log.Printf("Error retrieving file from form: %v", err)
				http.Error(w, "Failed to retrieve file", http.StatusBadRequest)
				return
			}
			log.Printf("No file provided for profile photo. Proceeding without one.")
		} else {
			defer file.Close()
			log.Printf("Found file: %s", handler.Filename)

			photoData, uploadErr := photoSvc.UploadAndStorePhotoSupabase(r.Context(), uid, file, handler.Filename, handler.Header.Get("Content-Type"))
			if uploadErr != nil {
				log.Printf("Error uploading photo: %v", uploadErr)
				http.Error(w, "Failed to upload photo", http.StatusInternalServerError)
				return
			}

			photoURL = photoData.URL
			log.Printf("Photo successfully uploaded. URL: %s", photoURL)
		}
		profileData.PhotoURL = photoURL

		createdProfile, err := svc.CreateUserProfileSupabase(r.Context(), uid, profileData)
		if err != nil {
			log.Printf("Error creating user profile: %v", err)
			if err.Error() == "Username already taken" {
				http.Error(w, "Username is already taken. Please choose a different one.", http.StatusConflict)
			} else if err.Error() == "User profile already exists" {
				http.Error(w, "A profile for this user already exists.", http.StatusConflict)
			} else {
				http.Error(w, fmt.Sprintf("Failed to create user profile: %v", err), http.StatusInternalServerError)
			}
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
