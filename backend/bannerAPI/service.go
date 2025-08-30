package BannerService

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"os"

	// _"embed"
	SupabaseUsers "services/supabase/userservice"
)

type Service struct {
	userService *SupabaseUsers.SupabaseService
}

func NewService(userSvc *SupabaseUsers.SupabaseService) *Service {
	return &Service{
		userService: userSvc,
	}
}

func (s *Service) GetBannerMessage(ctx context.Context) (*BannerMessage, error) {
	fileName := "bannerAPI/banner.json"
	messages, err := os.ReadFile(fileName)
	if err != nil {
		log.Printf("An error occurred while trying to read banner json file, %s: %v", messages, err)
		return nil, fmt.Errorf("failed to read banner json")
	}
	if len(messages) == 0 {
		log.Printf("The length of messages read is 0.")
		return nil, fmt.Errorf("failed to read any messages")
	}

	var dat map[string]interface{}
	if err := json.Unmarshal(messages, &dat); err != nil {
		log.Printf("An error occurred while unmarshaling json data: %v", err)
		return nil, fmt.Errorf("failed to unmarshal json data")
	}

	message, ok := dat["messages"].([]interface{})
	if !ok {
		return nil, fmt.Errorf("invalid format for messages")
	}

	stringMessages := make([]string, len(message))
	for i, v := range message {
		stringMessages[i] = fmt.Sprintf("%v", v)
	}

	randomInteger := rand.Intn(len(stringMessages))
	retrievedMessage := &BannerMessage{
		Message: stringMessages[randomInteger],
	}

	return retrievedMessage, nil
}
