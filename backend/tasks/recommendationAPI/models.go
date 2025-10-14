package RecommendationService

import TaskEnums "services/tasks/taskEnums"

type Recommendation struct {
	Id              string                   `json:"id"`
	Title           string                   `json:"title"`
	Notes           string                   `json:"notes"`
	Category        TaskEnums.GrowthCategory `json:"category"`
	TaskType        TaskEnums.TaskType       `json:"taskType,omitempty"`
	DefaultPoints   int                      `json:"defaultPoints"`
	DefaultPriority TaskEnums.PriorityType   `json:"defaultPriority,omitempty"`
	Quantity        float32                  `json:"quantity,omitempty"`
	TimeType        TaskEnums.TimeType       `json:"timeType,omitempty"`
}

type RecommendationList struct {
	Recommendations []Recommendation `json:"recommendations"`
}
