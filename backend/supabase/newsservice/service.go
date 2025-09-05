package newsservice

import (
	"context"
	"fmt"
	"log"
	firebaseService "services/firebase"

	"github.com/go-pg/pg/v10"

	firebaseAuth "firebase.google.com/go/v4/auth"
)

type Service struct {
	dbClient   *pg.DB
	authClient *firebaseAuth.Client
}

func NewService(dbClient *pg.DB, clients *firebaseService.Clients) *Service {
	return &Service{
		dbClient:   dbClient,
		authClient: clients.Auth,
	}
}

func (s *Service) UpdateDailyNews(ctx context.Context, limit int, sentiment float32) ([]NewsData, error) {
	var newsStories []NewsData
	err := s.dbClient.Model(&newsStories).Select()
	if err != nil {
		log.Printf("error fetching news data from Supabase db: %v", err)
		return nil, fmt.Errorf("error fetching news data")
	}
	return newsStories, nil
}
