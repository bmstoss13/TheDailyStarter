package SupabaseQuotes

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"services/quoteservice/zenquotes"
	redisclient "services/redis"
	"time"

	"github.com/go-pg/pg/v10"
	"github.com/redis/go-redis/v9"
)

type SupabaseService struct {
	dbClient    *pg.DB
	redisClient *redisclient.Client
}

// clients passed to this service need to be Supabase clients.
// main.go will use this new function to consume supabase services.
func NewSupabaseService(dbClient *pg.DB, redis *redisclient.Client) *SupabaseService {
	return &SupabaseService{
		dbClient:    dbClient,
		redisClient: redis,
	}
}

func (s *SupabaseService) GetAllQuotesSupabase(ctx context.Context) ([]DailyQuote, error) {
	var quotes []DailyQuote
	err := s.dbClient.Model(&quotes).Select()
	if err != nil {
		log.Printf("Error fetching quotes from Supabase: %v", err)
		return nil, fmt.Errorf("failed to fetch all quotes from supabase")
	}

	return quotes, nil
}

func (s *SupabaseService) GetOrCreateDailyQuote(ctx context.Context) (*DailyQuote, error) {
	today := time.Now().Format("2006-01-02")
	var quote DailyQuote
	err := s.dbClient.Model(&quote).Where("id = ?", today).Select()
	if err == nil {
		log.Println("Daily quote already in db.")
		return &quote, nil
	}

	if err != pg.ErrNoRows {
		log.Printf("Error checking for existing quote: %v", err)
		return nil, fmt.Errorf("failed to check for existing quote")
	}

	zenquotesService := &zenquotes.Service{}
	newQuoteFromAPI, err := zenquotesService.FetchDailyQuote(ctx)
	if err != nil {
		log.Printf("Error fetching daily quote from the api: %v", err)
		return nil, fmt.Errorf("failed to fetch quote from API")
	}
	quoteToStore := DailyQuote{
		ID:        today,
		Quote:     newQuoteFromAPI.Q,
		Author:    newQuoteFromAPI.A,
		CreatedAt: time.Now(),
	}

	_, err = s.dbClient.Model(&quoteToStore).Insert()
	if err != nil {
		log.Printf("Error storing the daily quote: %v", err)
		return nil, fmt.Errorf("failed to store the daily quote for today")
	}

	return &quoteToStore, nil

}

func (s *SupabaseService) UpdateAndStoreDailyQuote(ctx context.Context) error {
	today := time.Now().Format("2006-01-02")
	var quote DailyQuote
	err := s.dbClient.Model(&quote).Where("id = ?", today).Select()
	if err == nil {
		log.Println("Daily quote already in db.")
		return nil
	}

	if err != pg.ErrNoRows {
		log.Printf("Error checking for existing quote: %v", err)
		return fmt.Errorf("failed to check for existing quote")
	}

	zenquotesService := &zenquotes.Service{}
	newQuoteFromAPI, err := zenquotesService.FetchDailyQuote(ctx)
	if err != nil {
		log.Printf("Error fetching daily quote from the api: %v", err)
		return fmt.Errorf("failed to fetch quote from API")
	}

	quoteToStore := DailyQuote{
		ID:        today,
		Quote:     newQuoteFromAPI.Q,
		Author:    newQuoteFromAPI.A,
		CreatedAt: time.Now(),
	}

	_, err = s.dbClient.Model(&quoteToStore).Insert()
	if err != nil {
		log.Printf("Error storing the daily quote: %v", err)
		return fmt.Errorf("failed to store the daily quote for today")
	}

	s.MarshalQuoteAndStoreInRedis(ctx, quoteToStore)

	log.Printf("Successfully fetched daily quote from zenquotes")
	return nil
}

func (s *SupabaseService) GetDailyQuoteFromCache(ctx context.Context) (*DailyQuote, error) {
	cachedData, err := s.redisClient.Get(ctx, redisQuoteKey).Bytes()

	if err == nil {
		var quoteData DailyQuote
		if err := json.Unmarshal([]byte(cachedData), &quoteData); err != nil {

			log.Printf("an error occurred while unmarshalling quote cache from redis: %s", err)
		} else {

			log.Println("Fetched quote from Redis cache.")
			return &quoteData, nil
		}
	} else if err != redis.Nil {

		// A genuine error occurred, log and return it
		log.Printf("Redis error while fetching '%s': %v", redisQuoteKey, err)
		return nil, fmt.Errorf("redis error: %w", err)
	}

	log.Printf("Cache miss or unmarshal failure, fetching from database.")
	var quoteData DailyQuote
	today := time.Now().Format("2006-01-02")
	query := s.dbClient.WithContext(ctx).Model((*DailyQuote)(nil)).Where("id = ?", today)
	if err := query.Select(&quoteData); err != nil {
		log.Printf("an error occurred while fetching quote from the db: %s", err)
		return nil, fmt.Errorf("failed to fetch quote: %s", err)
	}

	s.MarshalQuoteAndStoreInRedis(ctx, quoteData)

	return &quoteData, nil
}

// Helper function that marshals DailyQuote struct into JSON and storing it in Redis with a 24-hour expiration
func (s *SupabaseService) MarshalQuoteAndStoreInRedis(ctx context.Context, quoteData DailyQuote) {
	marshalledQuote, marshalErr := json.Marshal(quoteData)
	if marshalErr != nil {

		log.Printf("an error occurred while marshalling quote data: %s", marshalErr)
	} else {
		if err := s.redisClient.Set(ctx, redisQuoteKey, marshalledQuote, 24*time.Hour).Err(); err != nil {
			log.Printf("An error occurred while storing daily quote in Redis cache: %v", err)
		}
	}
}
