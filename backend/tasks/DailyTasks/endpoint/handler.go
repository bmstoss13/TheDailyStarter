package DailyTaskEndpoint

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	DailyTaskService "services/tasks/DailyTasks"
	sharedCtx "services/utils/context"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
)

func DailyTaskHandler(svc *DailyTaskService.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		uid, ok := r.Context().Value(sharedCtx.UIDKey).(string)
		if !ok || uid == "" {
			log.Printf("DailyTaskHandler: Unauthorized request, UID not found in context.")
			http.Error(w, "Unauthorized.", http.StatusUnauthorized)
			return
		}

		switch r.Method {
		case http.MethodPost:
			handleCreateDailyTask(w, r, svc, uid)
		case http.MethodGet:
			handleGetUserDailyTasks(w, r, svc, uid)
		case http.MethodPut:
			handleUpdateUserDailyTask(w, r, svc, uid)
		case http.MethodDelete:
			handleDeleteDailyTask(w, r, svc, uid)
		case http.MethodPatch:
			handleToggleTaskAsCompleted(w, r, svc, uid)
		default:
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		}
	}
}

// Handler for creating a new daily task
func handleCreateDailyTask(w http.ResponseWriter, r *http.Request, svc *DailyTaskService.Service, uid string) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	var req DailyTaskService.DailyTask
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("Failed to decode create daily task request body: %v", err)
		http.Error(w, "Bad request body", http.StatusBadRequest)
		return
	}

	req.UserId = uid

	err := svc.CreateUserDailyTask(ctx, &req)
	if err != nil {
		log.Printf("Failed to create daily task: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
}

// Handler for getting daily tasks for a given user
func handleGetUserDailyTasks(w http.ResponseWriter, r *http.Request, svc *DailyTaskService.Service, uid string) {

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()
	dailyTasks, err := svc.GetUserDailyTasks(ctx, uid)
	if err != nil {
		log.Printf("Failed to retrieve daily tasks for user %v: %v", uid, err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(&dailyTasks); err != nil {
		log.Printf("an error occurred while marshalling daily tasks.")
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}

// Handler for updating a user task in the body
func handleUpdateUserDailyTask(w http.ResponseWriter, r *http.Request, svc *DailyTaskService.Service, uid string) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()
	var updatedTask DailyTaskService.DailyTask
	if err := json.NewDecoder(r.Body).Decode(&updatedTask); err != nil {
		log.Printf("Failed to decode update daily task request body: %v", err)
		http.Error(w, "Bad request body", http.StatusBadRequest)
		return
	}

	updatedTask.UserId = uid

	err := svc.UpdateUserDailyTask(ctx, &updatedTask)
	if err != nil {
		log.Printf("Error while updating the user's daily task: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusAccepted)
}

// Handler for deleting a user daily task
func handleDeleteDailyTask(w http.ResponseWriter, r *http.Request, svc *DailyTaskService.Service, uid string) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()
	//Get task from the url sent in
	taskId := chi.URLParam(r, "taskId")
	if taskId == "" {
		log.Printf("handleDeleteDailyTask: Bad request, task id not found in params.")
		http.Error(w, "Bad Request", http.StatusBadRequest)
		return
	}

	err := svc.DeleteUserDailyTask(ctx, uid, taskId)
	if err != nil {
		if errors.Is(err, DailyTaskService.ErrTaskNotFoundOrUnauthorized) {
			log.Printf("Daily task not found or unauthorized access attempt.")
			http.Error(w, "Not Found", http.StatusNotFound)
			return
		}
		log.Printf("Error deleting user %v's daily task, with id %v: %v", uid, taskId, err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func handleToggleTaskAsCompleted(w http.ResponseWriter, r *http.Request, svc *DailyTaskService.Service, uid string) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	taskId := chi.URLParam(r, "taskId")
	if taskId == "" {
		log.Printf("handleToggleTaskAsCompleted: Bad request, task id not found in params.")
		http.Error(w, "Bad Request", http.StatusBadRequest)
		return
	}

	isComplete, err := strconv.ParseBool(chi.URLParam(r, "isComplete"))
	if err != nil {
		log.Printf("Error while converting isComplete to boolean: %v", err)
		http.Error(w, "Bad Request", http.StatusBadRequest)
		return
	}

	toggleErr := svc.ToggleTaskCompletion(ctx, taskId, isComplete)
	if toggleErr != nil {
		log.Printf("Error while toggling task %v: %v", taskId, toggleErr)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
}
