package userservice

import (
	"context"
	"fmt"
	"log"
	firebaseService "services/firebase"
	"strings"

	"time"

	"cloud.google.com/go/firestore"
	firebaseAuth "firebase.google.com/go/v4/auth"
	"google.golang.org/api/iterator"
)

type Service struct {
	firestoreClient *firestore.Client
	authClient      *firebaseAuth.Client
}

func NewService(clients *firebaseService.Clients) *Service {
	return &Service{
		firestoreClient: clients.Firestore,
		authClient:      clients.Auth,
	}
}

func (s *Service) GetUserProfile(ctx context.Context, uid string) (*UserProfileData, error) {
	docRef := s.firestoreClient.Collection(userCollection).Doc(uid)
	docSnap, err := docRef.Get(ctx)
	if err != nil {
		log.Printf("Data snapshot does not exist for given uid: %s", uid)
		return nil, fmt.Errorf("an error occurred while trying to fetch user information: %w", err)
	}

	var userProfile UserProfileData
	if err := docSnap.DataTo(&userProfile); err != nil {
		return nil, fmt.Errorf("failed to convert user profile data: %w", err)
	}

	return &userProfile, nil
}

func (s *Service) GetAllUserProfiles(ctx context.Context) ([]UserProfileData, error) {
	ref := s.firestoreClient.Collection(userCollection)
	iter := ref.Documents(ctx)
	defer iter.Stop()

	var users []UserProfileData
	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			log.Printf("error fetching user data from firebase collection, %v", err)
			return nil, fmt.Errorf("failed to fetch all users")
		}

		var user UserProfileData
		if err := doc.DataTo(&user); err != nil {
			log.Printf("Error converting document into user data: %v", err)
			continue
		}

		user.UID = doc.Ref.ID
		users = append(users, user)

		if len(users) == 0 {
			log.Printf("No documents found in the %s collection", userCollection)
			return []UserProfileData{}, nil
		}

	}
	return users, nil
}

func (s *Service) CreateUserProfile(ctx context.Context, uid string, profileData UserProfileData) (*UserProfileData, error) {
	profileData.Username = strings.ToLower(profileData.Username)
	userRef := s.firestoreClient.Collection(userCollection).Doc(uid)
	usernameRef := s.firestoreClient.Collection(usernameCollection).Doc(profileData.Username)

	err := s.firestoreClient.RunTransaction(ctx, func(txctx context.Context, tx *firestore.Transaction) error {
		usernameDoc, err := tx.Get(usernameRef)
		if err != nil {
			return fmt.Errorf("failed to get username document in transaction: %w", err)
		}
		if usernameDoc.Exists() {
			return ErrUsernameTaken
		}

		userDoc, err := tx.Get(userRef)
		if err != nil {
			return fmt.Errorf("failed to get user document in transaction: %w", err)
		}

		if userDoc.Exists() {
			return ErrUserProfileExists
		}
		now := time.Now()

		profileData.CreatedAt = now

		userSetErr := tx.Set(userRef, profileData)
		if userSetErr != nil {
			return fmt.Errorf("failed to set user document: %v", userSetErr)
		}

		newUsernameEntry := Username{
			UID:       uid,
			Username:  profileData.Username,
			CreatedAt: now,
		}
		seterr := tx.Set(usernameRef, newUsernameEntry)
		if seterr != nil {
			return fmt.Errorf("failed to set username document: %w", seterr)
		}

		return nil
	})
	if err != nil {
		// Differentiate between custom errors and other errors
		if userErr, ok := err.(*UserError); ok {
			return nil, userErr // Propagate custom errors directly
		}
		return nil, fmt.Errorf("an error occurred during user profile creation: %w", err)
	}

	log.Printf("Backend: Transaction successful for %s. Profile and username created.", uid)
	return &profileData, nil
}

func (s *Service) DeleteUserProfileAndUsername(ctx context.Context, uid string) error {
	err := s.firestoreClient.RunTransaction(ctx, func(txctx context.Context, tx *firestore.Transaction) error {
		userRef := s.firestoreClient.Collection(userCollection).Doc(uid)
		userDoc, err := tx.Get(userRef)
		if err != nil {
			return fmt.Errorf("failed to get user document in transaction: %w", err)
		}

		var userData UserProfileData
		if err := userDoc.DataTo(&userData); err != nil {
			return fmt.Errorf("failed to conver user data for deletion: %w", err)
		}

		usernameRef := s.firestoreClient.Collection(usernameCollection).Doc(strings.ToLower(userData.Username))

		tx.Delete(userRef)
		tx.Delete(usernameRef)

		return nil
	})

	if err != nil {
		return fmt.Errorf("transaction failed while deleting user with uid %s: %w", uid, err)
	}

	err = s.authClient.DeleteUser(ctx, uid)
	if err != nil {
		return fmt.Errorf("failed to delete user from Firebase Auth for uid %s: %w", uid, err)
	}
	log.Printf("Successfully deleted user %s and their username", uid)
	return nil
}

// UpdateUserProfile updates a user profile.
func (s *Service) UpdateUserProfile(ctx context.Context, uid string, updates map[string]interface{}) error {
	docRef := s.firestoreClient.Collection(userCollection).Doc(uid)
	_, err := docRef.Update(ctx, convertMapToFirestoreUpdates(updates))
	if err != nil {
		return fmt.Errorf("an error occurred while updating user profile for uid %s: %w", uid, err)
	}
	log.Printf("User profile for %s updated.", uid)
	return nil
}

// Helper to convert a map to firestore.Update array for partial updates
func convertMapToFirestoreUpdates(m map[string]interface{}) []firestore.Update {
	var updates []firestore.Update
	for k, v := range m {
		updates = append(updates, firestore.Update{Path: k, Value: v})
	}
	return updates
}

func (s *Service) GetSearchedUsersCapped(ctx context.Context, query string) ([]UserSearchResult, error) {
	if strings.TrimSpace(query) == "" {
		return []UserSearchResult{}, nil // Return empty slice for empty query
	}

	iter := s.firestoreClient.Collection(userCollection).
		Where("username", ">=", strings.ToLower(query)). // Normalize query for username field
		Where("username", "<=", strings.ToLower(query)+"\uf8ff").
		Limit(10).
		Select("uid", "username", "photoURL").
		Documents(ctx)
	defer iter.Stop()

	var searchResults []UserSearchResult
	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, fmt.Errorf("error iterating search results: %w", err)
		}

		var result UserSearchResult
		if err := doc.DataTo(&result); err != nil {
			return nil, fmt.Errorf("failed to convert search result data: %w", err)
		}
		searchResults = append(searchResults, result)
	}

	if len(searchResults) == 0 {
		log.Printf("No users found for query: %s", query)
		return []UserSearchResult{}, nil // Return empty slice if no results
	}
	return searchResults, nil
}

func (s *Service) UpdateLastQuoteShown(ctx context.Context, uid, date string) error {
	docRef := s.firestoreClient.Collection(userCollection).Doc(uid)

	_, err := docRef.Update(ctx, []firestore.Update{
		{
			Path:  "lastQuoteShown",
			Value: date,
		},
	})

	if err != nil {
		log.Printf("An error occurred while updating the last quote shown on user %s: %v", uid, err)
	}

	return nil
}
