package DailyTaskService

import (
	"context"
	"errors"
	SupabaseUsers "services/supabase/userservice"
	"testing"

	"github.com/go-pg/pg/v10"
	"github.com/go-pg/pg/v10/orm"
)

type MockQueryRunner struct {
	ExpectedError error
	RowsAffected  int
	TasksToReturn []DailyTask
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
	return m.ExpectedError
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
				// A. Did we get an error at all?
				if err == nil {
					t.Errorf("FAIL: Expected error: %v, but got nil", tt.expectedErr)
					return
				}
				// B. Did the error we got match the one we expected?
				if !errors.Is(err, tt.expectedErr) {
					t.Errorf("FAIL: Expected error: %v, got different error: %v", tt.expectedErr, err)
				}
				// 2. Check if success was expected (tt.expectedErr is nil)
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
			expectedErr:  errors.New("database error"),
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
