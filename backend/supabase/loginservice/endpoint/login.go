package SupabaseLoginEndpoint

import (
	"encoding/json"
	"log"
	"net/http"
	SupabaseLogin "services/supabase/loginservice"
	SupabaseQuotes "services/supabase/quoteservice"
	SupabaseUsers "services/supabase/userservice"
	"time"
)

func LoginHandler(userSvc *SupabaseUsers.SupabaseService, quoteSvc *SupabaseQuotes.SupabaseService) http.HandlerFunc {
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

		userProfile, err := userSvc.GetUserProfileSupabase(r.Context(), uid)
		if err != nil {
			log.Printf("Error getting user profile for UID %s: ,%v", uid, err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

		today := time.Now().Format("2006-01-02")
		if userProfile.LastQuoteShown == today {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(SupabaseLogin.LoginFlowResponse{
				IsNewQuote: false,
			})
			return
		}

		dailyQuote, err := quoteSvc.GetOrCreateDailyQuote(r.Context())
		if err != nil {
			log.Printf("Error getting or creating daily quote: %v", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

		if err := userSvc.UpdateLastQuoteAndAlbumSupabase(r.Context(), uid, today); err != nil {
			log.Printf("Error updating LastQuoteShown for UID %s: %v", uid, err)
			http.Error(w, "Failed to update user profile.", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(SupabaseLogin.LoginFlowResponse{
			DailyQuote: dailyQuote,
			IsNewQuote: true,
		})
	}
}
