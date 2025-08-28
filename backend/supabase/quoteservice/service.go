package SupabaseQuotes

import (
	"context"
	"fmt"
	"log"
	"services/quoteservice/zenquotes"
	"time"

	// "github.com/francoisdtm/supabase-go"
	"github.com/go-pg/pg/v10"
	// "github.com/go-pg/pg/v10/orm"
)

type SupabaseService struct {
	dbClient *pg.DB
}

// clients passed to this service need to be Supabase clients.
// main.go will use this new function to consume supabase services.
func NewSupabaseService(dbClient *pg.DB) *SupabaseService {
	return &SupabaseService{
		dbClient: dbClient,
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
