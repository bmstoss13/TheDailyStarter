package worldnewsapi

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"strconv"
	"time"
)

const (
	baseURL = "https://api.worldnewsapi.com/search-news"
)

type Client struct {
	apiKey string
}

func NewClient(apiKey string) *Client {
	return &Client{
		apiKey: apiKey,
	}
}

// Get positive news from World News API
func (c *Client) GetPositiveNews(ctx context.Context, number int, sentiment float32, useMonth bool, offset int) ([]Article, error) {
	now := time.Now().UTC()
	var earliest time.Time

	// If using a month or week ago for earliest publish date
	if useMonth {
		earliest = now.AddDate(0, -1, 0) // A month ago
	} else {
		earliest = now.AddDate(0, 0, -7) // A day ago
	}

	earliestStr := earliest.Format("2006-01-02")

	// Get params from url
	params := url.Values{}
	params.Add("api-key", c.apiKey)
	params.Add("number", fmt.Sprintf("%d", number))
	params.Add("min-sentiment", strconv.FormatFloat(float64(sentiment), 'f', 2, 32))
	params.Add("language", "en")
	// params.Add("sort", "publish-time")
	// params.Add("sort-direction", "DESC")
	params.Add("earliest-publish-date", earliestStr)

	params.Add("offset", fmt.Sprintf("%d", offset))

	fullURL := fmt.Sprintf("%s?%s", baseURL, params.Encode())
	log.Printf("url encoded with params: %v", fullURL)
	// Make request to api with context
	req, err := http.NewRequestWithContext(ctx, "GET", fullURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to make request: %w", err)
	}

	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API request failed with status code: %v", resp.StatusCode)
	}

	var apiResponse Response
	if err := json.NewDecoder(resp.Body).Decode(&apiResponse); err != nil {
		return nil, fmt.Errorf("failed to decode API response: %w", err)
	}

	return apiResponse.News, nil
}
