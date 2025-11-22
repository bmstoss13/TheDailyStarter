package DailyTaskService

import (
	"context"
	"errors"
	"reflect"
	SupabaseUsers "services/supabase/userservice"
	"testing"

	"github.com/go-pg/pg/v10"
	"github.com/go-pg/pg/v10/orm"
)

type MockQueryRunner struct {
	ExpectedError error
	RowsAffected  int
	TasksToReturn []DailyTask
	DestModel     interface{}
	pg.Result
}

type MockResult struct {
	Rows int
}

// func (m MockResult) Model(model interface{}) pg.Result {
// 	var res pg.Result
// 	return res
// }

func (m *MockResult) RowsAffected() int {
	return m.Rows
}

func (m *MockResult) RowsReturned() int {
	return m.Rows
}

func (m *MockResult) Model() orm.Model {
	return nil
}

func (m *MockQueryRunner) Where(query string, params ...interface{}) QueryRunner {
	return m
}

func (m *MockQueryRunner) Select() error {
	if m.ExpectedError != nil {
		return m.ExpectedError
	}

	if m.TasksToReturn != nil && m.DestModel != nil {
		destValue := reflect.ValueOf(m.DestModel)

		sliceValue := destValue.Elem()
		sliceValue.Set(reflect.ValueOf(m.TasksToReturn))
	}

	return nil
}

func (m *MockQueryRunner) Insert() (pg.Result, error) {
	if m.ExpectedError != nil {
		return nil, m.ExpectedError
	}

	return &MockResult{Rows: m.RowsAffected}, nil
}

func (m *MockQueryRunner) Set(query string, params ...interface{}) QueryRunner {
	return m
}

func (m *MockQueryRunner) WherePK() QueryRunner {
	return m
}

func (m *MockQueryRunner) Update() (res pg.Result, err error) {
	if m.ExpectedError != nil {
		return nil, m.ExpectedError
	}

	return &MockResult{Rows: m.RowsAffected}, nil
}

func (m *MockQueryRunner) Delete() (res pg.Result, err error) {
	if m.ExpectedError != nil {
		return nil, m.ExpectedError
	}

	return &MockResult{Rows: m.RowsAffected}, nil
}

type MockDataStore struct {
	Runner *MockQueryRunner
}

func (m *MockDataStore) WithContext(ctx context.Context) DataStore {
	return m // Returns self for chaining, as Model() is defined on DataStore
}

func (m *MockDataStore) Model(model interface{}) QueryRunner {
	// Returns the predefined runner for execution
	m.Runner.DestModel = model
	return m.Runner
}

// Set up the test suite for daily tasks
func setupTest() (*Service, *MockQueryRunner) {
	runner := &MockQueryRunner{
		RowsAffected: 1, // Default to success
	}

	mockDB := &MockDataStore{
		Runner: runner,
	}

	mockUserSvc := &SupabaseUsers.SupabaseService{}
	svc := NewService(mockDB, mockUserSvc)

	return svc, runner
}

func TestCreateUserDailyTask(t *testing.T) {
	tests := []struct {
		name        string
		expectedErr error
	}{
		{
			name:        "Success_TaskCreated",
			expectedErr: nil,
		},
		{
			name:        "Failure_DatabaseConnection",
			expectedErr: errors.New("failed to delete associated daily task"),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			svc, runner := setupTest()

			runner.ExpectedError = tt.expectedErr

			newTask := &DailyTask{
				UserId: "user123",
			}

			err := svc.CreateUserDailyTask(context.Background(), newTask)
			if tt.expectedErr != nil {

				if err == nil {
					t.Errorf("FAIL: Expected error: %v, but got nil", tt.expectedErr)
					return
				}

				if !errors.Is(err, tt.expectedErr) {
					t.Errorf("FAIL: Expected error: %v, got different error: %v", tt.expectedErr, err)
				}

			} else {
				if err != nil {
					t.Errorf("FAIL: Expected no error, but got: %v", err)
				}
			}
		})
	}
}

func TestDeleteUserDailyTask(t *testing.T) {
	tests := []struct {
		name         string
		rowsAffected int
		expectedErr  error
	}{
		{
			name:         "Success_TaskDeleted",
			rowsAffected: 1,
			expectedErr:  nil,
		},
		{
			name:         "Failure_TaskNotFoundOrUnauthorized",
			rowsAffected: 0,
			expectedErr:  ErrTaskNotFoundOrUnauthorized,
		},
		{
			name:         "Failure_DatabaseError",
			rowsAffected: 1,
			expectedErr:  errors.New("failed to delete associated daily task"),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			svc, runner := setupTest()

			runner.RowsAffected = tt.rowsAffected

			if tt.expectedErr != nil && tt.expectedErr != ErrTaskNotFoundOrUnauthorized {
				runner.ExpectedError = tt.expectedErr
			}

			uid := "user123"
			taskId := "1"

			err := svc.DeleteUserDailyTask(context.Background(), uid, taskId)

			if tt.expectedErr != nil {
				if err == nil {
					t.Errorf("FAIL: Expected error: %v, but got nil", tt.expectedErr)
				} else if !errors.Is(err, tt.expectedErr) {
					if tt.name == "Failure_DatabaseError" {
						if err.Error() != tt.expectedErr.Error() {
							t.Errorf("FAIL: Expected error message %q, got %q", tt.expectedErr.Error(), err.Error())
						}
					} else {
						t.Errorf("FAIL: Expected error %v, got %v", tt.expectedErr, err)
					}
				}
			} else {
				if err != nil {
					t.Errorf("FAIL: Expected no error, but got: %v", err)
				}
			}
		})
	}
}

func TestGetUserDailyTasks(t *testing.T) {
	tests := []struct {
		name          string
		expectedErr   error
		uid           string
		tasksToReturn []DailyTask
	}{
		{
			name:        "Success_GetOnlyUserTasks",
			expectedErr: nil,
			uid:         "user123",
			tasksToReturn: []DailyTask{
				{
					UserId: "user123",
				},
				{
					UserId: "user123",
				},
			},
		},
		{
			name:          "Failure_UserIdNotProvided",
			expectedErr:   errors.New("user Id required"),
			uid:           "",
			tasksToReturn: nil,
		},
		{
			name:          "Failure_FailedToRetrieveDailyTasks",
			expectedErr:   errors.New("failed to get user daily tasks"),
			uid:           "user123",
			tasksToReturn: nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			svc, runner := setupTest()
			runner.TasksToReturn = tt.tasksToReturn

			if tt.expectedErr != nil {
				runner.ExpectedError = tt.expectedErr
			}

			uid := tt.uid
			dailyTasks, err := svc.GetUserDailyTasks(context.Background(), uid)

			if tt.expectedErr != nil {
				if err == nil {
					t.Errorf("FAIL: Expected error: %v, but got nil", tt.expectedErr)
				} else if !errors.Is(err, tt.expectedErr) {
					if tt.name == "Failure_FailedToRetrieveDailyTasks" {
						if err.Error() != tt.expectedErr.Error() {
							t.Errorf("FAIL: Expected error message %q, got %q", tt.expectedErr.Error(), err.Error())
						}
					} else {
						if err.Error() != tt.expectedErr.Error() {
							t.Errorf("FAIL: Expected error %v, got %v", tt.expectedErr, err)
						}

					}
				}
			} else {
				if err != nil {
					t.Errorf("FAIL: Expected no error, but got: %v", err)
				} else if !reflect.DeepEqual(dailyTasks, runner.TasksToReturn) {
					t.Errorf("FAIL: Daily tasks returned by GetUserDailyTasks does not reflect the tasks to be returned.")
				}
			}
		})
	}
}

func TestUpdateUserDailyTask(t *testing.T) {
	tests := []struct {
		name         string
		rowsAffected int
		expectedErr  error
	}{
		{
			name:         "Success_DailyTaskUpdated",
			rowsAffected: 1,
			expectedErr:  nil,
		},
		{
			name:         "Failure_FailedToUpdateDailyTask",
			rowsAffected: 0,
			expectedErr:  errors.New("failed to update daily task"),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			svc, runner := setupTest()

			runner.RowsAffected = tt.rowsAffected
			runner.ExpectedError = tt.expectedErr

			updatedTask := &DailyTask{
				UserId: "user123",
			}

			err := svc.UpdateUserDailyTask(context.Background(), updatedTask)
			if tt.expectedErr != nil {
				if err == nil {
					t.Errorf("FAIL: Expected error %v, but got nil", tt.expectedErr)
				} else if !errors.Is(err, tt.expectedErr) {
					if err.Error() != tt.expectedErr.Error() {
						t.Errorf("FAIL: Expected error %v, but got %v", tt.expectedErr, err)
					}

				}
			} else {
				if err != nil {
					t.Errorf("FAIL: Expected no error but got %v", err)
				}
			}
		})
	}
}

func TestToggleTaskCompletion(t *testing.T) {
	trueBool := true
	falseBool := false
	tests := []struct {
		name         string
		rowsAffected int
		expectedErr  error
		taskId       string
		isComplete   *bool
	}{
		{
			name:         "Success_ToggledTaskCompletion",
			rowsAffected: 1,
			expectedErr:  nil,
			taskId:       "1",
			isComplete:   &trueBool,
		},
		{
			name:         "Failure_DidNotToggleTaskCompletion",
			rowsAffected: 1,
			expectedErr:  errors.New("failed to toggle task completion status"),
			taskId:       "1",
			isComplete:   &trueBool,
		},
		{
			name:         "Failure_ToggledTaskNotFoundOrUnauthorized",
			rowsAffected: 0,
			expectedErr:  ErrTaskNotFoundOrUnauthorized,
			taskId:       "1",
			isComplete:   &falseBool,
		},
		{
			name:         "Failure_DidNotProvideTaskId",
			rowsAffected: 0,
			expectedErr:  errors.New("taskId required"),
			taskId:       "",
			isComplete:   &trueBool,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			svc, runner := setupTest()
			runner.RowsAffected = tt.rowsAffected
			if tt.expectedErr != nil && tt.expectedErr != ErrTaskNotFoundOrUnauthorized {
				runner.ExpectedError = tt.expectedErr
			}
			taskId := tt.taskId
			isComplete := tt.isComplete
			err := svc.ToggleTaskCompletion(context.Background(), taskId, *isComplete)
			if tt.expectedErr != nil {
				if err == nil {
					t.Errorf("FAIL: expected error %v, got nil", tt.expectedErr)
				} else if !errors.Is(err, tt.expectedErr) {
					if tt.taskId == "" && err.Error() != tt.expectedErr.Error() {
						t.Errorf("FAIL: Expected taskId but got no taskId.")
					} else if err.Error() != tt.expectedErr.Error() {
						t.Errorf("FAIL: Expected error message %q, got %q", tt.expectedErr.Error(), err.Error())
					}
				}
			} else {
				if err != nil {
					t.Errorf("FAIL: Expected no error but got %v", err)
				}
			}
		})
	}
}
