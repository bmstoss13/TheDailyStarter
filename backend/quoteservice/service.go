package quoteservice

import (
	"context"
	"fmt"
	"log"
	firebaseService "services/firebase"
	"services/quoteservice/zenquotes"
	"time"

	"cloud.google.com/go/firestore"
	firebaseAuth "firebase.google.com/go/v4/auth"
	"google.golang.org/api/iterator"
)

type Service struct {
	firestoreClient *firestore.Client
	authClient      *firebaseAuth.Client
}

func NewService(clients *firebaseService.Clients) *Service {
	return &Service{
		firestoreClient: clients.Firestore,
		authClient:      clients.Auth,
	}
}

func (s *Service) GetAllDailyQuotes(ctx context.Context) ([]DailyQuote, error) {
	ref := s.firestoreClient.Collection(quotesCollection)
	iter := ref.Documents(ctx)
	defer iter.Stop()

	var quotes []DailyQuote
	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			log.Printf("Error fetching quotes from firebase collection: %v", err)
			return nil, fmt.Errorf("failed to fetch daily quotes")
		}

		var quote DailyQuote
		if err := doc.DataTo(&quote); err != nil {
			log.Printf("Error converting document to DailyQuote: %v", err)
			continue
		}

		quote.ID = doc.Ref.ID
		quotes = append(quotes, quote)
	}
	if len(quotes) == 0 {
		log.Printf("No documents found in the %s collection", quotesCollection)
		return []DailyQuote{}, nil
	}

	return quotes, nil
}

func (s *Service) GetOrCreateDailyQuoteForToday(ctx context.Context) (*DailyQuote, error) {
	today := time.Now().Format("2006-01-02") //iso string equivalent
	ref := s.firestoreClient.Collection(quotesCollection).Doc(today)

	snapshot, err := ref.Get(ctx)
	if err == nil && snapshot.Exists() {
		log.Println("Daily quote already added in database.")
		var quote DailyQuote
		if err := snapshot.DataTo(&quote); err != nil {
			log.Printf("Error converting document to daily quote: %v", err)
			return nil, fmt.Errorf("failed to parse existing quote")
		}
		quote.ID = snapshot.Ref.ID
		return &quote, nil
	}

	zenquotesService := &zenquotes.Service{}

	newDailyQuoteFromApi, err := zenquotesService.FetchDailyQuote(ctx)
	if err != nil {
		log.Printf("Error fetching daily quote from the api: %v", err)
		return nil, fmt.Errorf("failed to fetch quote from API")
	}

	quoteToStore := DailyQuote{
		Quote:  newDailyQuoteFromApi.Q,
		Author: newDailyQuoteFromApi.A,
		Date:   today,
	}

	_, err = ref.Set(ctx, quoteToStore)
	if err != nil {
		log.Printf("An error occurred while storing the daily quote: %v", err)
		return nil, fmt.Errorf("failed to store the daily quote for today")
	}

	quoteToStore.ID = today
	return &quoteToStore, nil
}
