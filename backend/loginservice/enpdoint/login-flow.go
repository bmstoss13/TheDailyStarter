package LoginEndpoint

import (
	"encoding/json"
	"log"
	"net/http"
	"services/loginservice"
	"services/quoteservice"
	"services/userservice"
	"time"
)

func LoginFlowHandler(userSvc *userservice.Service, quoteSvc *quoteservice.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
			return
		}

		uid, ok := r.Context().Value("uid").(string)
		if !ok || uid == "" {
			http.Error(w, "Unauthorized access. User ID required.", http.StatusUnauthorized)
			return
		}

		userProfile, err := userSvc.GetUserProfile(r.Context(), uid)
		if err != nil {
			log.Printf("Error getting user profile for UID %s: ,%v", uid, err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

		today := time.Now().Format("2006-01-02")
		if userProfile.LastQuoteShown == today {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(loginservice.LoginFlowResponse{
				IsNewQuote: false,
			})
			return
		}

		dailyQuote, err := quoteSvc.GetOrCreateDailyQuoteForToday(r.Context())
		if err != nil {
			log.Printf("Error getting or creating daily quote: %v", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

		if err := userSvc.UpdateLastQuoteShown(r.Context(), uid, today); err != nil {
			log.Printf("Error updating LastQuoteShown for UID %s: %v", uid, err)
			http.Error(w, "Failed to update user profile.", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(loginservice.LoginFlowResponse{
			DailyQuote: dailyQuote,
			IsNewQuote: true,
		})
	}
}
