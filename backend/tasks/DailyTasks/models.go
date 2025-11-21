package DailyTaskService

import (
	"context"
	TaskService "services/tasks/TaskService"
	TaskEnums "services/tasks/taskEnums"

	"github.com/go-pg/pg/v10"
)

type DailyTask struct {
	Task      TaskService.Task `pg:",embed"`
	tableName struct{}         `pg:"daily_task"`

	UserId   string                 `pg:"user_id,fk" json:"uid"`
	Priority TaskEnums.PriorityType `pg:"priority" json:"priority"`
	IsDaily  bool                   `pg:"is_daily" json:"isDaily"`
}

type DataStore interface {
	Model(model interface{}) QueryRunner
	WithContext(ctx context.Context) DataStore
}

type QueryRunner interface {
	Where(query string, params ...interface{}) QueryRunner
	Select() (err error)
	Insert() (res pg.Result, err error)
	Set(query string, params ...interface{}) QueryRunner
	WherePK() QueryRunner
	Update() (res pg.Result, err error)
	Delete() (res pg.Result, err error)
}
