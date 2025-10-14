package RecommendationService

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
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

/**
* Return all recommendations from personal api - currently json from in-app directory.
 */
func (svc *Service) GetAllRecommendations(ctx context.Context) (*[]Recommendation, error) {
	fileName := "tasks/recommendationAPI/recommendations.json" //filepath of the json - will most likely add to redis

	//read the file
	recommendationBytes, err := os.ReadFile(fileName)
	log.Printf("recommendations: %v", recommendationBytes)
	if err != nil {
		log.Printf("error while trying to read recommendations json: %v", err)
		return nil, fmt.Errorf("failed to read recommendations json")
	}

	//catch if the length of the json is 0
	if len(recommendationBytes) == 0 {
		log.Printf("the length of recommendations must be greater than 0")
		return nil, fmt.Errorf("failed to read any recommendations")
	}

	//unmarshal json data onto string field to be read into a Recommendation array
	// var dat map[string]interface{}

	var recommendationList RecommendationList
	if err := json.Unmarshal(recommendationBytes, &recommendationList); err != nil {
		log.Printf("error while unmarshaling recommendations json data: %v", err)
		return nil, fmt.Errorf("failed to unmarshal recommendations json data")
	}

	// log.Printf("dat: %v", dat)
	// recommendation, ok := dat["recommendations"].([]Recommendation)
	// if !ok {
	// 	log.Printf("ok: %v", ok)
	// 	log.Printf("recommendation: %v", recommendation)
	// 	return nil, fmt.Errorf("invalid format for recommendations")
	// }

	// var recommendationData []Recommendation
	// for _, v := range recommendation {
	// 	recommendationItem := Recommendation{
	// 		Id:              v.Id,
	// 		Title:           v.Title,
	// 		Notes:           v.Notes,
	// 		Category:        v.Category,
	// 		TaskType:        v.TaskType,
	// 		DefaultPoints:   v.DefaultPoints,
	// 		DefaultPriority: v.DefaultPriority,
	// 		Quantity:        v.Quantity,
	// 		TimeType:        v.TimeType,
	// 	}

	// 	recommendationData = append(recommendationData, recommendationItem)
	// }

	return &recommendationList.Recommendations, nil
}
