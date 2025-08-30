package SupabaseShinesEndpoint

import (
	"encoding/json"
	"log"
	"net/http"
	SupabasePhotos "services/supabase/photoservice"
	SupabaseShines "services/supabase/shineservice"
	sharedCtx "services/utils/context"
	"strconv"
)

type createShineRequest struct {
	Text     string `json:"text"`
	MediaURL string `json:"mediaURL"`
}

func ShineHandler(shineSvc *SupabaseShines.Service, photoSvc *SupabasePhotos.SupabaseService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		uid, ok := r.Context().Value(sharedCtx.UIDKey).(string)

		if !ok || uid == "" {
			log.Println("ShineHandler: Unauthorized request, UID not found in context.")
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		switch r.Method {
		case http.MethodGet:
			handleGetShines(w, r, uid, shineSvc)
		case http.MethodPost:
			handlePostShine(w, r, uid, shineSvc, photoSvc)
		default:
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		}
	}
}

func handleGetShines(w http.ResponseWriter, r *http.Request, uid string, shineSvc *SupabaseShines.Service) {
	limitStr := r.URL.Query().Get("limit")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 10
	}

	startAfterShineId := r.URL.Query().Get("startAfter")

	shines, err := shineSvc.GetShines(r.Context(), limit, startAfterShineId, uid)
	log.Printf("user ids: %v", uid)
	if err != nil {
		log.Printf("Failed to get shines: %v", err)
		http.Error(w, "Failed to get shines", http.StatusInternalServerError)
		return
	}

	if shines == nil {
		shines = []SupabaseShines.ShineDataWithRayStatus{}
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(shines); err != nil {
		log.Printf("Failed to encode shines response: %v", err)
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}

func handlePostShine(w http.ResponseWriter, r *http.Request, uid string, ShineSvc *SupabaseShines.Service, PhotoSvc *SupabasePhotos.SupabaseService) {
	// var reqBody createShineRequest
	// if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
	// 	http.Error(w, "Invalid request body", http.StatusBadRequest)
	// 	return
	// }

	// if reqBody.Text == "" {
	// 	http.Error(w, "Text is required for shines", http.StatusBadRequest)
	// 	return
	// }
	// createdShine, err := ShineSvc.CreateShine(r.Context(), uid, reqBody.Text, reqBody.MediaURL)
	// if err != nil {
	// 	log.Printf("Failed to create shine: %v", err)
	// 	http.Error(w, "Failed to create shine", http.StatusInternalServerError)
	// 	return
	// }

	// w.Header().Set("Content-Type", "application/json")
	// w.WriteHeader(http.StatusCreated)
	// if err := json.NewEncoder(w).Encode(&createdShine); err != nil {
	// 	log.Printf("Failed to encode created shine response: %v", err)
	// 	http.Error(w, "Failed to encode response", http.StatusInternalServerError)
	// 	return
	// }
	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		log.Printf("Failed to parse multipart form: %v", err)
		http.Error(w, "Failed to parse multipart form", http.StatusBadRequest)
		return
	}

	text := r.FormValue("text")
	if text == "" {
		log.Printf("Text not included in shine: %v", err)
		http.Error(w, "Text is required to post shine.", http.StatusBadRequest)
		return
	}

	file, header, err := r.FormFile("photo")
	if err != nil && err != http.ErrMissingFile {
		http.Error(w, "Error reading uploaded file", http.StatusBadRequest)
		return
	}
	defer func() {
		if file != nil {
			file.Close()
		}
	}()

	var mediaURL string
	if file != nil {
		photo, err := PhotoSvc.UploadAndStorePhotoSupabase(r.Context(), uid, file, header.Filename, header.Header.Get("Content-Type"))
		if err != nil {
			log.Printf("Failed to upload photo: %v", err)
			http.Error(w, "Failed to upload photo", http.StatusInternalServerError)
			return
		}
		mediaURL = photo.URL
	}

	createdShine, err := ShineSvc.CreateShine(r.Context(), uid, text, mediaURL)
	if err != nil {
		log.Printf("Failed to create shine: %v", err)
		http.Error(w, "Failed to create shine", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	if err := json.NewEncoder(w).Encode(&createdShine); err != nil {
		log.Printf("Failed to encode created shine response: %v", err)
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}
