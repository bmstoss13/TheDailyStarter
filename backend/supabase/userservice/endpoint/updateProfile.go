package SupabaseUserEndpoint

import (
	"encoding/json"
	"log"
	"net/http"
	SupabasePhotos "services/supabase/photoservice"
	SupabaseUsers "services/supabase/userservice"
	sharedCtx "services/utils/context"
)

func UpdateProfileHandler(svc *SupabaseUsers.SupabaseService, photoSvc *SupabasePhotos.SupabaseService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		uid, ok := r.Context().Value(sharedCtx.UIDKey).(string)
		if !ok || uid == "" {
			log.Printf("UpdateProfileHandler: user is unauthorized")
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		err := r.ParseMultipartForm(10 << 20)
		if err != nil {
			log.Printf("Error parsing multipart form: %v", err)
			http.Error(w, "Bad Request", http.StatusBadRequest)
			return
		}

		updateData := make(map[string]interface{})

		if firstName := r.FormValue("firstName"); firstName != "" {
			updateData["firstName"] = firstName
		}

		if lastName := r.FormValue("lastName"); lastName != "" {
			updateData["lastName"] = lastName
		}

		if dob := r.FormValue("dob"); dob != "" {
			updateData["dob"] = dob
		}

		if username := r.FormValue("username"); username != "" {
			updateData["username"] = username
		}

		if bio := r.FormValue("bio"); bio != "" {
			updateData["bio"] = bio
		}

		if pronouns := r.FormValue("pronouns"); pronouns != "" {
			updateData["pronouns"] = pronouns
		}

		if customPronouns := r.FormValue("customPronouns"); customPronouns != "" {
			updateData["customPronouns"] = customPronouns
		}

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

			photoURL := photoData.URL
			updateData["photoURL"] = photoURL
			log.Printf("Photo successfully uploaded. URL: %s", photoURL)
		}

		updateErr := svc.UpdateUserProfileSupabase(r.Context(), uid, updateData)
		if updateErr != nil {
			log.Printf("an error occurred while updating profile data: %v", updateErr)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		if err := json.NewEncoder(w).Encode(&updateData); err != nil {
			log.Printf("an error occurred while encoding updated user data: %v", err)
			http.Error(w, "Failed to encode update data", http.StatusInternalServerError)
			return
		}
	}
}
