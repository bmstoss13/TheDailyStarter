package TaskService

import (
	TaskEnums "services/tasks/taskEnums"
	"time"
)

type Task struct {
	Id            string                   `pg:"id,pk" json:"id"`
	Title         string                   `pg:"title" json:"title"`
	Notes         string                   `pg:"notes" json:"notes,omitempty"`
	ProgressSteps []Task                   `pg:"progress_steps,array" json:"progressSteps,omitempty"`
	Category      TaskEnums.GrowthCategory `pg:"category" json:"category"`
	Quantity      *float64                 `pg:"quantity" json:"quantity,omitempty"`
	TimeType      TaskEnums.TimeType       `pg:"time_type" json:"timeType,omitempty"`
	Budget        *float64                 `pg:"budget" json:"budget,omitempty"`
	CreatedAt     time.Time                `pg:"created_at" json:"createdAt"`
	IsComplete    bool                     `pg:"is_complete" json:"isComplete"`
	Points        int                      `pg:"points" json:"points,omitempty"`
	CompletedAt   *time.Time               `pg:"completed_at" json:"completedAt,omitempty"`
}
