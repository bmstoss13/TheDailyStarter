package RecommendationsEndpoint

import (
	"encoding/json"
	"log"
	"net/http"
	RecommendationService "services/tasks/recommendationAPI"
)

func RecommendationsHandler(svc *RecommendationService.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			handleGetAllRecommendations(w, r, svc)
		default:
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
			return
		}
	}
}

func handleGetAllRecommendations(w http.ResponseWriter, r *http.Request, svc *RecommendationService.Service) {
	recData, err := svc.GetAllRecommendations(r.Context())
	if err != nil {
		log.Printf("error fetching recommendations from recommendations api: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	if recData == nil {
		log.Printf("no recommendation data received")
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(recData); err != nil {
		log.Printf("Error encoding response: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
}
