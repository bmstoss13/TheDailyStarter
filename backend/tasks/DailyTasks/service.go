package DailyTaskService

import (
	"context"
	"errors"
	"fmt"
	"log"
	SupabaseUsers "services/supabase/userservice"

	"github.com/go-pg/pg/v10"
)

var (
	ErrTaskNotFoundOrUnauthorized = errors.New("task not found or user unauthorized")
)

type Service struct {
	db          DataStore
	userService *SupabaseUsers.SupabaseService
}

func NewService(db DataStore, userSvc *SupabaseUsers.SupabaseService) *Service {
	return &Service{
		db:          db,
		userService: userSvc,
	}
}

func (s *Service) CreateUserDailyTask(ctx context.Context, newTask *DailyTask) error {

	_, err := s.db.WithContext(ctx).Model(newTask).
		Insert()
	if err != nil {
		log.Printf("Error inserting new daily task into supabase: %v", err)
		return err
	}
	return nil
}

func (s *Service) GetUserDailyTasks(ctx context.Context, uid string) ([]DailyTask, error) {
	var dailyTasks []DailyTask

	if uid == "" {
		log.Printf("User ID not provided.")
		return nil, fmt.Errorf("user Id required")
	}

	err := s.db.WithContext(ctx).Model(&dailyTasks).
		Where("user_id = ?", uid).
		Select()

	if err != nil && err != pg.ErrNoRows {
		log.Printf("Error while getting user %v daily tasks: %v", uid, err)
		return nil, fmt.Errorf("failed to get user daily tasks")
	}

	log.Printf("Daily tasks retrieved: %v", dailyTasks)
	return dailyTasks, nil
}

func (s *Service) UpdateUserDailyTask(ctx context.Context, updatedTask *DailyTask) error {

	//Some important fields that could be changed
	//TODO: Finish all fields that could be changed
	_, err := s.db.WithContext(ctx).Model(updatedTask).
		Set("title = ?", updatedTask.Task.Title).
		Set("notes = ?", updatedTask.Task.Notes).
		Set("progress_steps = ?", updatedTask.Task.ProgressSteps).
		Set("priority = ?", updatedTask.Priority).
		Set("category = ?", updatedTask.Task.Category).
		WherePK().
		Update()

	if err != nil {
		log.Printf("Error updating daily task: %v", err)
		return fmt.Errorf("failed to update daily task")
	}
	return nil
}

func (s *Service) DeleteUserDailyTask(ctx context.Context, uid string, taskID string) error {
	res, err := s.db.WithContext(ctx).Model(&DailyTask{}).
		Where("id = ?", taskID).
		Where("user_id = ?", uid).
		Delete()

	if err != nil {
		log.Printf("Failed to delete daily task for task %s: %v", taskID, err)
		return fmt.Errorf("failed to delete associated daily task")
	}

	if res.RowsAffected() == 0 {
		return ErrTaskNotFoundOrUnauthorized
	}

	return nil
}

func (s *Service) ToggleTaskCompletion(ctx context.Context, taskID string, isComplete bool) error {

	if taskID == "" {
		log.Printf("Task ID must be provided.")
		return fmt.Errorf("taskId required")
	}

	var completedAt string
	if isComplete {
		completedAt = "NOW()"
	} else {
		completedAt = "NULL"
	}

	res, err := s.db.WithContext(ctx).Model(&DailyTask{}).
		Where("id = ?", taskID).
		Set("is_complete = ?", isComplete).
		Set("completed_at = " + completedAt).
		Update()

	if err != nil {
		log.Printf("Failed to toggle daily task %s to %t: %v", taskID, isComplete, err)
		return fmt.Errorf("failed to toggle task completion status")
	}

	if res.RowsAffected() == 0 {
		log.Printf("Daily task being toggled not found or user unauthorized")
		return ErrTaskNotFoundOrUnauthorized
	}

	log.Printf("Task is complete.")
	return nil
}
