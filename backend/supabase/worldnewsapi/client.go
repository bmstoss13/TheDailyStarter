package worldnewsapi

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
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

func (c *Client) GetPositiveNews(ctx context.Context, number int, sentiment float32, useMonth bool) ([]Article, error) {
	now := time.Now().UTC()
	var earliest time.Time
	if useMonth {
		earliest = now.AddDate(0, -1, 0)
	} else {
		earliest = now.AddDate(0, 0, -7)
	}

	earliestStr := earliest.Format("2006-01-02")

	params := url.Values{}
	params.Add("api-key", c.apiKey)
	params.Add("number", fmt.Sprintf("%d", number))
	params.Add("min-sentiment", fmt.Sprintf("%f", sentiment))
	params.Add("language", "en")
	params.Add("sort", "sentiment")
	params.Add("earliest-publish-date", earliestStr)

	fullURL := fmt.Sprintf("%s?%s", baseURL, params.Encode())

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
