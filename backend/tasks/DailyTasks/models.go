package DailyTaskService

import (
	TaskService "services/tasks/TaskService"
	TaskEnums "services/tasks/taskEnums"
)

type DailyTask struct {
	TaskService.Task
	tableName struct{} `pg:"daily_task"`

	UserId   string                 `pg:"user_id,fk" json:"uid"`
	Priority TaskEnums.PriorityType `pg:"priority" json:"priority"`
	IsDaily  bool                   `pg:"is_daily" json:"isDaily"`
}
