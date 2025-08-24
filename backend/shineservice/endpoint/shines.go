package ShinesEndpoint

import (
	"encoding/json"
	"log"
	"net/http"
	"services/shineservice"
	"strconv"
)

type createShineRequest struct {
	Text     string `json:"text"`
	MediaURL string `json:"mediaURL"`
}

func ShineHandler(shineSvc *shineservice.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		uid, ok := r.Context().Value("uid").(string)

		if !ok || uid == "" {
			log.Println("ShineHandler: Unauthorized request, UID not found in context.")
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		switch r.Method {
		case http.MethodGet:
			handleGetShines(w, r, uid, shineSvc)
		case http.MethodPost:
			handlePostShine(w, r, uid, shineSvc)
		default:
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		}
	}
}

// can be used to get multiple or just 1 shine, very useful
func handleGetShines(w http.ResponseWriter, r *http.Request, uid string, shineSvc *shineservice.Service) {
	limitStr := r.URL.Query().Get("limit")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 20
	}

	startAfterShineId := r.URL.Query().Get("startAfter")

	shines, err := shineSvc.GetShines(r.Context(), limit, startAfterShineId, uid)
	if err != nil {
		log.Printf("Failed to get shines: %v", err)
		http.Error(w, "Failed to get shines", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(shines); err != nil {
		log.Printf("Failed to encode shines response: %v", err)
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
	}
}

func handlePostShine(w http.ResponseWriter, r *http.Request, uid string, shineSvc *shineservice.Service) {
	var reqBody createShineRequest
	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if reqBody.Text == "" {
		http.Error(w, "Text is required for shines", http.StatusBadRequest)
		return
	}

	createdShine, err := shineSvc.CreateShine(r.Context(), uid, reqBody.Text, reqBody.MediaURL)
	if err != nil {
		log.Printf("Failed to create shine: %v", err)
		http.Error(w, "Failed to create shine", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	if err := json.NewEncoder(w).Encode(createdShine); err != nil {
		log.Printf("Failed to encode created shine response: %v", err)
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
	}
}
