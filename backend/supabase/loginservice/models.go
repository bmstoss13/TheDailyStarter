package SupabaseLogin

import (
	SupabaseQuotes "services/supabase/quoteservice"
)

// json request structure - uid
type LoginFlowRequest struct {
	UID string `json:"uid"`
}

// json response structure - dailyQuote and isNewQuote
type LoginFlowResponse struct {
	DailyQuote *SupabaseQuotes.DailyQuote `json:"dailyQuote,omitempty"`
	IsNewQuote bool                       `json:"isNewQuote"`
}
