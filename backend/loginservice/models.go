package loginservice

import (
	"services/quoteservice"
)

// json request structure - uid
type LoginFlowRequest struct {
	UID string `json:"uid"`
}

// json response structure - dailyQuote and isNewQuote
type LoginFlowResponse struct {
	DailyQuote *quoteservice.DailyQuote `json:"dailyQuote,omitempty"`
	IsNewQuote bool                     `json:"isNewQuote"`
}
