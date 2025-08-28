package SupabaseUsers

import (
	"context"
	"fmt"
	"log"
	firebaseService "services/firebase"
	"strings"
	"time"

	firebaseAuth "firebase.google.com/go/v4/auth"

	"github.com/go-pg/pg/v10"
)

type SupabaseService struct {
	dbClient   *pg.DB
	authClient *firebaseAuth.Client
}

func NewSupabaseService(dbClient *pg.DB, clients *firebaseService.Clients) *SupabaseService {
	return &SupabaseService{
		dbClient:   dbClient,
		authClient: clients.Auth,
	}
}

func (s *SupabaseService) GetUserProfileSupabase(ctx context.Context, uid string) (*UserProfileData, error) {
	var user UserProfileData
	err := s.dbClient.Model(&user).Where("uid = ?", uid).Select()
	if err == nil {
		return &user, nil
	}
	if err == pg.ErrNoRows {
		log.Printf("User profile not found for uid: %s", uid)
		return nil, ErrUserNotFound
	}
	return nil, fmt.Errorf("failed to conver user profile data: %w", err)
}

func (s *SupabaseService) GetAllUserProfilesSupabase(ctx context.Context, uid string) ([]UserProfileData, error) {
	var users []UserProfileData
	err := s.dbClient.Model(&users).Select()
	if err != nil {
		log.Printf("Error fetching user data from Supabase: %v", err)
		return nil, fmt.Errorf("failed to fetch all users")
	}
	if len(users) == 0 {
		log.Println("No users found in the database.")
		return []UserProfileData{}, nil
	}
	return users, nil
}
func (s *SupabaseService) CreateUserProfileSupabase(ctx context.Context, uid string, profileData UserProfileData) (*UserProfileData, error) {
	profileData.Username = strings.ToLower(profileData.Username)
	tx, err := s.dbClient.Begin()
	if err != nil {
		return nil, fmt.Errorf("failed to being supabase transaction with error: %w", err)
	}

	defer tx.Close()

	count, err := tx.Model(&Username{}).Where("username = ?", profileData.Username).Count()
	if err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("failed to check for existing username: %w", err)
	}
	if count > 0 {
		tx.Rollback()
		return nil, ErrUsernameTaken
	}

	count, err = tx.Model(&UserProfileData{}).Where("uid = ?", profileData.UID).Count()
	if err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("failed to check for existing users: %w", err)
	}
	if count > 0 {
		tx.Rollback()
		return nil, ErrUserProfileExists
	}

	now := time.Now()

	profileData.UID = uid
	profileData.CreatedAt = now

	_, err = tx.Model(&profileData).Insert()
	if err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("failed to set user document: %v", err)
	}

	newUsernameEntry := Username{
		UID:       uid,
		Username:  profileData.Username,
		CreatedAt: now,
	}

	_, err = tx.Model(&newUsernameEntry).Insert()
	if err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("failed to insert username entry: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	log.Printf("Transaction successful for %s. Profile and username created.", uid)
	return &profileData, nil
}

func (s *SupabaseService) DeleteUserProfileSupabase(ctx context.Context, uid string) error {
	tx, err := s.dbClient.Begin()

	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Close()

	var user UserProfileData
	err = tx.Model(&user).Where("uid = ?", uid).Select()
	if err != nil {
		tx.Rollback()
		if err == pg.ErrNoRows {
			return ErrUserNotFound
		}
		return fmt.Errorf("failed to find user for deletion: %w", err)
	}

	_, err = tx.Model(&user).Where("uid = ?", uid).Delete()
	if err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to delete user profile: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("transaction failed: %w", err)
	}

	err = s.authClient.DeleteUser(ctx, uid)
	if err != nil {
		return fmt.Errorf("failed to delete user from Firebase Auth for uid %s: %w", uid, err)
	}

	log.Printf("Successfully deleted user %s and their username", uid)
	return nil
}

func (s *SupabaseService) UpdateUserProfileSupabase(ctx context.Context, uid string, updates map[string]interface{}) error {
	if len(updates) == 0 {
		return nil
	}

	user := &UserProfileData{UID: uid}
	query := s.dbClient.ModelContext(ctx, user)

	for key, value := range updates {
		query = query.Set("? = ?", pg.Ident(key), value)
	}

	result, err := query.WherePK().Update()
	if err != nil {
		return fmt.Errorf("an error occurred while updating user profile for uid %s: %w", uid, err)
	}

	log.Printf("User profile for %s updated. Rows affected: %d", uid, result.RowsAffected())
	return nil
}

func (s *SupabaseService) GetSearchedUsersFromSupabase(ctx context.Context, query string) ([]UserSearchResult, error) {
	if strings.TrimSpace(query) == "" {
		return []UserSearchResult{}, nil
	}

	var searchResults []UserSearchResult
	err := s.dbClient.Model(&UserSearchResult{}).
		Where("username ILIKE ?", fmt.Sprintf("%%%s%%", query)).
		Limit(10).
		Select()

	if err != nil {
		log.Printf("Error searching users: %v", err)
		return nil, fmt.Errorf("failed to perform user search: %w", err)
	}

	if len(searchResults) == 0 {
		log.Printf("No users found for query: %s", query)
		return []UserSearchResult{}, nil
	}

	return searchResults, nil
}

func (s *SupabaseService) UpdateLastQuoteAndAlbumSupabase(ctx context.Context, uid, date string) error {
	var user UserProfileData

	err := s.dbClient.Model(&user).
		Where("uid = ?", uid).
		Select()

	if err != nil {
		if err == pg.ErrNoRows {
			return ErrUserNotFound
		}
		return fmt.Errorf("failed to fetch user profile: %w", err)
	}

	user.QuotesAlbum = append(user.QuotesAlbum, date)

	_, err = s.dbClient.Model(&user).
		Set("lastQuoteShown = ?", date).
		Set("quotesAlbum = ?", user.QuotesAlbum).
		Where("uid = ?", uid).
		Update()

	if err != nil {
		return fmt.Errorf("failed to update user's profile with the last quote shown")
	}

	return nil
}

func (s *SupabaseService) IsAdmin(ctx context.Context, uid string) (bool, error) {
	var user UserProfileData
	err := s.dbClient.Model(&user).
		Column("isAdmin").
		Where("uid = ?", uid).
		Select()

	if err != nil {
		return false, fmt.Errorf("failed to determine whether user is admin or not")
	}

	return user.IsAdmin, nil
}
