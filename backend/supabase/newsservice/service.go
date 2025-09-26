package newsservice

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	redisclient "services/redis"
	"services/supabase/worldnewsapi"
	"strconv"
	"time"

	"github.com/go-pg/pg/v10"
	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
)

type Service struct {
	dbClient    *pg.DB
	apiClient   *worldnewsapi.Client
	redisClient *redisclient.Client
}

func NewService(dbClient *pg.DB, apiClient *worldnewsapi.Client, redisClient *redisclient.Client) *Service {
	return &Service{
		dbClient:    dbClient,
		apiClient:   apiClient,
		redisClient: redisClient,
	}
}

// Helper to update daily news from World News API.
func (s *Service) UpdateDailyNews(ctx context.Context, limit int, sentiment float32) error {

	// Get offset from redis if in cache
	offsetStr, err := s.redisClient.Get(ctx, "news_offset").Result()
	currentOffset := 0
	if err == nil {

		// Convert offset string from cache to an int
		if offset, err := strconv.Atoi(offsetStr); err == nil {
			currentOffset = offset
		} else {
			log.Printf("Failed to convert news offset string into int")
		}
		// Offset not detected in redis
	} else if err != redis.Nil {
		log.Printf("Failed to get offset from Redis: %v. Using default offset 0.", err)
	}

	log.Printf("Using API offset: %d", currentOffset)

	// Get news stories from api
	newStories, err := s.apiClient.GetPositiveNews(ctx, limit, sentiment, false, currentOffset)
	if err != nil {
		log.Printf("Failed to fetch new stories: %v", err)
		return fmt.Errorf("failed to fetch new stories from api")
	}

	// Instantiate list for news stories to be put into
	var convertedNews []NewsData
	for _, story := range newStories {
		parsedTime, err := time.Parse("2006-01-02 15:04:05", story.PublishDate)
		if err != nil {
			log.Printf("Failed to parse date for article `%s`: %v", story.Title, err)
			parsedTime = time.Now()
		}

		// Create new data item for each new story
		newsItem := NewsData{
			Id:        uuid.New().String(),
			CreatedAt: time.Now(),
			Title:     story.Title,
			Summary:   story.Summary,
			// Mapping API's "Text" field to "Description"
			ImageUrl:       story.Image,
			SourceUrl:      story.URL,
			SentimentScore: story.Sentiment,
			PublishDate:    parsedTime,
		}

		// Add each news item to list of news stories
		convertedNews = append(convertedNews, newsItem)
	}

	// Run Supabase transaction to delete each news story in db to replace with new ones
	err = s.dbClient.RunInTransaction(ctx, func(tx *pg.Tx) error {
		_, err := tx.Model((*NewsData)(nil)).Where("1=1").Delete()
		if err != nil {
			return err
		}

		_, err = tx.Model(&convertedNews).Insert()
		if err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		log.Printf("Transaction failed to update news stories: %v", err)
		return fmt.Errorf("transaction failed to update news stories: %w", err)
	}

	// Update offset in redis cache
	var newOffset int
	if len(newStories) < limit {
		newOffset = 0 // Reset the offset to start over.
		log.Println("Reached end of available stories, resetting offset to 0.")
	} else {
		newOffset = currentOffset + limit
		log.Printf("Incrementing offset to %d for next run.", newOffset)
	}
	log.Println("Successfully updated daily news stories.")
	return nil
}

// Check redis cache for daily news. If not in cache, put fetch from db and put in cache
func (s *Service) GetDailyNewsFromSupabase(ctx context.Context) ([]NewsData, error) {

	// Get cached data, if it exists
	cachedData, err := s.redisClient.Get(ctx, "news").Bytes()

	// News data is in cache
	if err == nil {
		var newsData []NewsData
		if err := json.Unmarshal([]byte(cachedData), &newsData); err != nil {

			// Throw error in console, but let data be returned from db
			log.Printf("an error occurred while unmarshalling news cache from redis: %s", err)
		} else {

			// Cache hit: return data immediately
			log.Println("Fetched news from Redis cache.")
			return newsData, nil
		}
	} else if err != redis.Nil {

		// A genuine error occurred, log and return it
		log.Printf("Redis error while fetching 'daily_news': %v", err)
		return nil, fmt.Errorf("redis error: %w", err)
	}

	// Cache miss or unmarshal failure, fetch from the db
	log.Printf("Cache miss or unmarshal failure, fetching from database.")
	var newsData []NewsData
	query := s.dbClient.WithContext(ctx).Model((*NewsData)(nil))
	if err := query.Select(&newsData); err != nil {
		log.Printf("an error occurred while fetching news stories from the db: %s", err)
		return nil, fmt.Errorf("failed to fetch news stories: %s", err)
	}

	// Marshal the data and store in Redis
	marshalledNews, marshalErr := json.Marshal(newsData)
	if marshalErr != nil {

		// Don't return, as the db fetch was successful
		log.Printf("an error occurred while marshalling news data: %s", marshalErr)
	} else {

		// Set the cache with an expiration time (4 hours for now, six times every day)
		if err := s.redisClient.Set(ctx, "news", marshalledNews, 4*time.Hour).Err(); err != nil {
			log.Printf("An error occurred while storing news stories in Redis cache: %v", err)
		}
	}

	// Return the data fetched from the db
	log.Printf("Successfully fetched %d news stories from the database.", len(newsData))
	return newsData, nil
}
