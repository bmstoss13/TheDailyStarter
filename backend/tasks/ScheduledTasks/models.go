package ScheduledTask

import (
	DailyTaskService "services/tasks/DailyTasks"
	"time"
)

type ScheduledTask struct {
	DailyTask DailyTaskService.DailyTask

	StartTime time.Time  `pg:"start_time,notnull" json:"startTime"`
	EndTime   *time.Time `pg:"end_time" json:"endTime,omitempty"`
}
