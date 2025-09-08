package newsservice

import (
	"context"
	"fmt"
	"log"
	"services/supabase/worldnewsapi"
	"time"

	"github.com/go-pg/pg/v10"
	"github.com/google/uuid"
)

type Service struct {
	dbClient  *pg.DB
	apiClient *worldnewsapi.Client
}

func NewService(dbClient *pg.DB, apiClient *worldnewsapi.Client) *Service {
	return &Service{
		dbClient:  dbClient,
		apiClient: apiClient,
	}
}

func (s *Service) UpdateDailyNews(ctx context.Context, limit int, sentiment float32) error {
	// var newsStories []NewsData
	// err := s.dbClient.Model(&newsStories).Select()
	// if err != nil {
	// 	log.Printf("error fetching news data from Supabase db: %v", err)
	// 	return fmt.Errorf("error fetching news data")
	// }
	// return nil
	newStories, err := s.apiClient.GetPositiveNews(ctx, limit, sentiment, false)
	if err != nil {
		log.Printf("Failed to fetch new stories: %v", err)
		return fmt.Errorf("failed to fetch new stories from api")
	}

	var convertedNews []NewsData
	for _, story := range newStories {
		parsedTime, err := time.Parse("2006-01-02 15:04:05", story.PublishDate)
		if err != nil {
			log.Printf("Failed to parse date for article `%s`: %v", story.Title, err)
			parsedTime = time.Now()
		}
		newsItem := NewsData{
			Id:             uuid.New().String(),
			CreatedAt:      time.Now(),
			Title:          story.Title,
			Summary:        story.Summary,
			ArticleText:    story.Text, // Mapping API's "Text" field to "Description"
			ImageUrl:       story.Image,
			SourceUrl:      story.URL,
			SentimentScore: story.Sentiment,
			PublishDate:    parsedTime,
		}

		convertedNews = append(convertedNews, newsItem)
	}

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

	log.Println("Successfully updated daily news stories.")
	return nil
}
