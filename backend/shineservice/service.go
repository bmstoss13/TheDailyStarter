package shineservice

import (
	"context"
	"fmt"
	"log"
	firebaseService "services/firebase"
	"services/userservice"
	"time"

	"cloud.google.com/go/firestore"
	"google.golang.org/api/iterator"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type Service struct {
	firestoreClient *firestore.Client
	userService     *userservice.Service
}

func NewService(clients *firebaseService.Clients, userSvc *userservice.Service) *Service {
	return &Service{
		firestoreClient: clients.Firestore,
		userService:     userSvc,
	}
}

func (s *Service) CreateShine(ctx context.Context, uid string, text string, mediaURL string) (*ShineData, error) {
	userProfile, err := s.userService.GetUserProfile(ctx, uid)
	if err != nil {
		log.Printf("No user found for id: %s", uid)
		return nil, fmt.Errorf("no user found for id: %s: %w", uid, err)
	}

	newShineData := map[string]interface{}{
		"uid":           uid,
		"username":      userProfile.Username,
		"userPhotoURL":  userProfile.PhotoURL,
		"text":          text,
		"createdAt":     time.Now(),
		"rayCount":      0,
		"mediaURL":      mediaURL,
		"commentNumber": 0,
	}

	shineRef, _, err := s.firestoreClient.Collection(ShineCollection).Add(ctx, newShineData)
	if err != nil {
		log.Printf("An error occurred while creating shine: %v", err)
		return nil, fmt.Errorf("error while creating shine: %w", err)
	}

	newShine := ShineData{
		ID:            shineRef.ID,
		UID:           uid,
		Username:      userProfile.Username,
		UserPhotoURL:  userProfile.PhotoURL,
		Text:          text,
		CreatedAt:     time.Now(),
		RayCount:      0,
		MediaURL:      mediaURL,
		CommentNumber: 0,
	}

	log.Printf("New shine, %s, added by %s to collection", shineRef.ID, uid)
	return &newShine, nil
}

func (s *Service) GetShines(ctx context.Context, limit int, startAfterShineId string, uid string) ([]ShineDataWithRayStatus, error) {
	query := s.firestoreClient.Collection(ShineCollection).OrderBy("createdAt", firestore.Desc).Limit(limit)
	if startAfterShineId != "" {
		startAfterDoc, err := s.firestoreClient.Collection(ShineCollection).Doc(startAfterShineId).Get(ctx)
		if err != nil {
			log.Printf("Backend: start after shine id %s not found. Fetching from the beginning", startAfterShineId)
		} else {
			query = query.StartAfter(startAfterDoc)
		}
	}

	snapshotIter := query.Documents(ctx)
	defer snapshotIter.Stop()

	shinesWithStatus := make([]ShineDataWithRayStatus, 0)
	for {
		doc, err := snapshotIter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, fmt.Errorf("failed to iterate shines: %w", err)
		}

		var shine ShineData
		if err := doc.DataTo(&shine); err != nil {
			return nil, fmt.Errorf("failed to unmarshal shine data: %w", err)
		}
		shine.ID = doc.Ref.ID
		fmt.Print(shine.CreatedAt)

		hasRayed := false
		if uid != "" {
			var err error
			hasRayed, err = s.HasUserRayedShine(ctx, uid, shine.ID)
			if err != nil {
				return nil, fmt.Errorf("failed to check if user rayed shine: %v", err)
			}
		}

		shinesWithStatus = append(shinesWithStatus, ShineDataWithRayStatus{
			ShineData: shine,
			HasRayed:  hasRayed,
		})
	}
	log.Printf("Fetched %d shines.", len(shinesWithStatus))
	return shinesWithStatus, nil
}

func (s *Service) DeleteShine(ctx context.Context, uid string, shineId string) error {
	shineRef := s.firestoreClient.Collection(ShineCollection).Doc(shineId)

	shineDoc, err := shineRef.Get(ctx)
	if err != nil {
		log.Printf("Failed to get shine document: %v", err)
		return fmt.Errorf("error getting shined document to delete")
	}

	var shineData ShineData
	if err := shineDoc.DataTo(&shineData); err != nil {
		log.Printf("Failed to unmarshal shine data: %v", err)
		return fmt.Errorf("internal server error")

	}

	isOwner := shineData.UID == uid

	isAdmin, err := s.userService.IsAdmin(ctx, uid)
	if err != nil {
		return fmt.Errorf("failed to verify admin status: %w", err)
	}

	if !isOwner && !isAdmin {
		log.Printf("User %s is not authorized to delete shine %s.", uid, shineId)
		return fmt.Errorf("unauthorized to delete this shine")
	}

	bulkWriter := s.firestoreClient.BulkWriter(ctx)
	defer bulkWriter.Flush()

	raysIter := shineRef.Collection(RaySubcollection).Documents(ctx)
	for {
		doc, err := raysIter.Next()
		if err == iterator.Done {
			break
		}

		if err != nil {
			bulkWriter.End()
			log.Printf("Failed to iterate through rays subcollection: %v", err)
			return fmt.Errorf("internal server error")

		}
		bulkWriter.Delete(doc.Ref)
	}

	bulkWriter.Delete(shineRef)

	bulkWriter.End()
	log.Printf("Shine %s and all its rays deleted successfully.", shineId)
	return nil
}

func (s *Service) UpdateShine(ctx context.Context, uid string, shineId string, updates map[string]interface{}) error {
	shineRef := s.firestoreClient.Collection(ShineCollection).Doc(shineId)

	shineDoc, err := shineRef.Get(ctx)
	if err != nil {
		log.Printf("Failed to get shine document for update: %v", err)
		return fmt.Errorf("internal server error")
	}

	var shineData ShineData
	if err := shineDoc.DataTo(&shineData); err != nil {
		log.Printf("Failed to unmarshal shine data for update: %v", err)
		return fmt.Errorf("internal server error")
	}

	if shineData.UID != uid {
		log.Printf("User %s is not authorized to update shine %s.", uid, shineId)
		return fmt.Errorf("unauthorized to update this shine")
	}

	_, err = shineRef.Set(ctx, updates, firestore.MergeAll)
	if err != nil {
		log.Printf("Failed to update shine %s: %v", shineId, err)
		return fmt.Errorf("failed to update shine")
	}

	log.Printf("Shine %s updated successfully by user %s.", shineId, uid)
	return nil
}

func (s *Service) ToggleRay(ctx context.Context, uid string, shineId string) (bool, error) {
	shineRef := s.firestoreClient.Collection(ShineCollection).Doc(shineId)
	rayRef := shineRef.Collection(RaySubcollection).Doc(uid)

	rayAdded := false
	err := s.firestoreClient.RunTransaction(ctx, func(ctx context.Context, tx *firestore.Transaction) error {
		shineDoc, err := tx.Get(shineRef)
		if err != nil || !shineDoc.Exists() {
			if status.Code(err) == codes.NotFound {
				return fmt.Errorf("shine does not exist")
			}
			return fmt.Errorf("shine does not exist: %w", err)
		}

		rayDoc, err := tx.Get(rayRef)
		if err != nil && status.Code(err) != codes.NotFound {
			return fmt.Errorf("failed to get ray document: %w", err)
		}

		if rayDoc.Exists() {
			// A ray already exists; delete it and decrement the count.
			if err := tx.Delete(rayRef); err != nil {
				return fmt.Errorf("failed to delete ray document: %w", err)
			}
			if err := tx.Update(shineRef, []firestore.Update{
				{Path: "rayCount", Value: firestore.Increment(-1)},
			}); err != nil {
				return fmt.Errorf("failed to decrement ray count: %w", err)
			}
			rayAdded = false
		} else {
			// No ray exists; create it and increment the count.
			if err := tx.Set(rayRef, RayData{Timestamp: time.Now()}); err != nil {
				return fmt.Errorf("failed to set ray document: %w", err)
			}
			if err := tx.Update(shineRef, []firestore.Update{
				{Path: "rayCount", Value: firestore.Increment(1)},
			}); err != nil {
				return fmt.Errorf("failed to increment ray count: %w", err)
			}
			rayAdded = true
		}

		return nil
	})

	if err != nil {
		log.Printf("An error occurred while toggling ray: %v", err)
		return false, fmt.Errorf("error toggling ray: %w", err)
	}

	return rayAdded, nil
}

func (s *Service) HasUserRayedShine(ctx context.Context, uid string, shineId string) (bool, error) {
	rayRef := s.firestoreClient.Collection(ShineCollection).Doc(shineId).Collection(RaySubcollection).Doc(uid)
	rayDoc, err := rayRef.Get(ctx)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return false, nil
		}
		return false, fmt.Errorf("error while checking if user %s rayed shine: %v", uid, err)
	}
	return rayDoc.Exists(), nil
}
