package zenquotes

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
)

type Quote struct {
	Q string `json:"q"`
	A string `json:"a"`
}

type Service struct {
	client *http.Client
}

func (s *Service) FetchDailyQuote(ctx context.Context) (Quote, error) {
	const url = "https://zenquotes.io/api/today"

	res, err := http.Get(url)
	if err != nil {
		return Quote{}, fmt.Errorf("failed to make request to Zen Quotes API: %w", err)
	}

	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		return Quote{}, fmt.Errorf("failed to fetch quote: status code %d", res.StatusCode)
	}

	var quotes []Quote
	if err := json.NewDecoder(res.Body).Decode(&quotes); err != nil {
		return Quote{}, fmt.Errorf("failed to decode JSON response: %w", err)
	}

	if len(quotes) == 0 {
		return Quote{}, fmt.Errorf("received an empty quote list from API")
	}

	return quotes[0], nil
}
