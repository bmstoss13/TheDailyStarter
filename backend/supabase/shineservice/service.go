package SupabaseShines

import (
	"context"
	"fmt"
	"log"
	"time"

	SupabaseUsers "services/supabase/userservice" // Assuming this package contains your ShineData struct

	"github.com/go-pg/pg/v10"
	// Your shared context keys
)

// Service struct now uses the go-pg client
type Service struct {
	db          *pg.DB
	userService *SupabaseUsers.SupabaseService
}

// NewService now takes the go-pg DB client
func NewService(db *pg.DB, userSvc *SupabaseUsers.SupabaseService) *Service {
	return &Service{
		db:          db,
		userService: userSvc,
	}
}

// CreateShine creates a new shine record in the Supabase 'shines' table.
func (s *Service) CreateShine(ctx context.Context, uid string, text string, mediaURL string) (*ShineData, error) {
	// The new ShineData struct uses a separate users table, so we don't need
	// to fetch the user profile here. We only need the UID.
	newShine := &ShineData{
		Text:          text,
		UID:           uid, // This corresponds to the user_id foreign key
		CreatedAt:     time.Now(),
		RayCount:      0,
		MediaURL:      mediaURL,
		CommentNumber: 0,
	}

	// Insert the new shine into the database. The 'returning' clause
	// ensures the new ID and other generated fields are populated.
	_, err := s.db.WithContext(ctx).Model(newShine).Returning("*").Insert()
	if err != nil {
		log.Printf("An error occurred while creating shine: %v", err)
		return nil, fmt.Errorf("error while creating shine: %w", err)
	}

	log.Printf("New shine, %s, added by %s to collection", newShine.ID, uid)
	return newShine, nil
}

// GetShines fetches shines with pagination, joins user data, and checks for ray status.
func (s *Service) GetShines(ctx context.Context, limit int, startAfterShineId string, uid string) ([]ShineDataWithRayStatus, error) {
	// We now select into the final struct directly, as the query will populate all fields.
	var shines []ShineDataWithRayStatus
	log.Printf("uid: %v" + uid)

	query := s.db.WithContext(ctx).Model((*ShineData)(nil)).
		TableExpr("shines AS shineData").
		ColumnExpr("shineData.*").
		ColumnExpr(`UserProfileData.username AS username, UserProfileData."photoURL" AS "userPhotoUrl"`).
		// This join retrieves the user's data for each shine.
		Join("LEFT JOIN ? AS UserProfileData ON UserProfileData.uid = shineData.uid", pg.Ident(SupabaseUsers.UserProfileTableName)).
		// This new join is the key! It joins the rays table and checks for a ray
		// made by the *current user* (uid).
		Join(`LEFT JOIN ? AS RayData ON RayData."shineId" = shineData.id AND RayData.uid = ?`, pg.Ident(RayTable), uid).
		// This ColumnExpr checks if a ray was found for the current user.
		// If rayData.uid is not NULL, a matching ray was found, and 'hasRayed' will be true.
		ColumnExpr(`RayData.uid IS NOT NULL AS "hasRayed"`).
		OrderExpr(`shineData."createdAt" DESC`)

	if startAfterShineId != "" {
		// To handle pagination with go-pg, we fetch the document we want to start after,
		// then create a composite WHERE clause to correctly page results.
		var startAfterShine ShineData
		err := s.db.Model(&startAfterShine).Where("id = ?", startAfterShineId).Select()
		if err != nil {
			log.Printf("Backend: start after shine id %s not found. Fetching from the beginning", startAfterShineId)
		} else {
			query.Where(`shineData."createdAt" < ? OR (shineData."createdAt" = ? AND shineData.id < ?)`, startAfterShine.CreatedAt, startAfterShine.CreatedAt, startAfterShine.ID)
			log.Printf("Queried new shines.")
		}
	}

	query.Limit(limit)

	if err := query.Select(&shines); err != nil {
		return nil, fmt.Errorf("failed to fetch shines: %w", err)
	}

	log.Printf("Fetched %d shines.", len(shines))
	return shines, nil
}

// DeleteShine removes a shine and its associated rays.
func (s *Service) DeleteShine(ctx context.Context, uid string, shineId string) error {
	// Check if the user is authorized to delete the shine
	var shine ShineData
	err := s.db.WithContext(ctx).Model(&shine).Where("id = ?", shineId).Select()
	if err != nil {
		if err == pg.ErrNoRows {
			return fmt.Errorf("shine does not exist")
		}
		log.Printf("Failed to get shine for deletion: %v", err)
		return fmt.Errorf("internal server error")
	}

	isOwner := shine.UID == uid
	isAdmin, err := s.userService.IsAdmin(ctx, uid)
	if err != nil {
		return fmt.Errorf("failed to verify admin status: %w", err)
	}
	if !isOwner && !isAdmin {
		log.Printf("User %s is not authorized to delete shine %s.", uid, shineId)
		return fmt.Errorf("unauthorized to delete this shine")
	}

	// Delete rays first, then the shine itself, inside a transaction
	return s.db.RunInTransaction(ctx, func(tx *pg.Tx) error {
		// Delete all rays associated with this shine
		_, err := tx.Model(&RayData{}).Where(`"shineId" = ?`, shineId).Delete()
		if err != nil {
			log.Printf("Failed to delete rays for shine %s: %v", shineId, err)
			return fmt.Errorf("failed to delete associated rays")
		}
		// Delete the shine itself
		_, err = tx.Model(&ShineData{}).Where("id = ?", shineId).Delete()
		if err != nil {
			log.Printf("Failed to delete shine %s: %v", shineId, err)
			return fmt.Errorf("failed to delete shine")
		}
		return nil
	})
}

// UpdateShine updates a shine record.
func (s *Service) UpdateShine(ctx context.Context, uid string, shineId string, updates map[string]interface{}) error {
	var shine ShineData
	err := s.db.WithContext(ctx).Model(&shine).Where("id = ?", shineId).Select()
	if err != nil {
		if err == pg.ErrNoRows {
			return fmt.Errorf("shine does not exist")
		}
		return fmt.Errorf("failed to get shine for update: %w", err)
	}

	if shine.UID != uid {
		log.Printf("User %s is not authorized to update shine %s.", uid, shineId)
		return fmt.Errorf("unauthorized to update this shine")
	}

	// The map of updates can be directly applied to the model
	_, err = s.db.WithContext(ctx).Model(&shine).WherePK().Set("text = ?, mediaUrl = ?", updates["text"], updates["mediaURL"]).Update()
	if err != nil {
		log.Printf("Failed to update shine %s: %v", shineId, err)
		return fmt.Errorf("failed to update shine")
	}

	log.Printf("Shine %s updated successfully by user %s.", shineId, uid)
	return nil
}

// ToggleRay handles adding or removing a ray.
func (s *Service) ToggleRay(ctx context.Context, uid string, shineId string) (bool, error) {
	rayAdded := false
	err := s.db.RunInTransaction(ctx, func(tx *pg.Tx) error {
		var existingRay RayData
		err := tx.Model(&existingRay).Where(`"shineId" = ?`, shineId).Where("uid = ?", uid).Select()
		if err != nil && err != pg.ErrNoRows {
			return fmt.Errorf("failed to check for existing ray: %w", err)
		}

		var shine ShineData
		shineErr := tx.Model(&shine).Where("id = ?", shineId).Select()
		if shineErr != nil {
			return fmt.Errorf("failed to fetch shine owner: %w", err)
		}

		posterUID := shine.UID

		if err == pg.ErrNoRows {
			// No ray exists, so create one and increment the rayCount.
			newRay := &RayData{
				UID:       uid,
				ShineID:   shineId,
				CreatedAt: time.Now(),
			}

			_, insertErr := tx.Model(newRay).Insert()
			if insertErr != nil {
				return fmt.Errorf("failed to insert new ray: %w", insertErr)
			}
			_, updateErr := tx.Model(&ShineData{}).Where("id = ?", shineId).Set(`"rayCount" = "rayCount" + 1`).Update()
			if updateErr != nil {
				return fmt.Errorf("failed to increment ray count: %w", updateErr)
			}
			_, err := tx.Model(&SupabaseUsers.UserProfileData{}).Where("uid = ?", posterUID).Set(`"rayCount" = "rayCount" + 1`).Update()
			if err != nil {
				log.Printf("failed to increment ray count for user, %s: %v", posterUID, err)
				return fmt.Errorf("failed to increment ray count for user, %s: %v", posterUID, err)
			}
			rayAdded = true
		} else {
			// Ray exists, so delete it and decrement the rayCount.
			_, deleteErr := tx.Model(&existingRay).Where(`"shineId" = ?`, shineId).Where("uid = ?", uid).Delete()
			if deleteErr != nil {
				return fmt.Errorf("failed to delete ray: %w", deleteErr)
			}
			_, updateErr := tx.Model(&ShineData{}).Where("id = ?", shineId).Set(`"rayCount" = "rayCount" - 1`).Update()
			if updateErr != nil {
				return fmt.Errorf("failed to decrement ray count: %w", updateErr)
			}
			_, err := tx.Model(&SupabaseUsers.UserProfileData{}).Where("uid = ?", posterUID).Set(`"rayCount" = "rayCount" - 1`).Update()
			if err != nil {
				log.Printf("failed to decrement ray count for user, %s: %v", posterUID, err)
				return fmt.Errorf("failed to decrement ray count for user, %s: %v", posterUID, err)
			}
			rayAdded = false
		}
		return nil
	})

	if err != nil {
		log.Printf("An error occurred while toggling ray: %v", err)
		return false, fmt.Errorf("error toggling ray: %w", err)
	}

	return rayAdded, nil
}

// HasUserRayedShine checks if a user has "rayed" a specific shine.
func (s *Service) HasUserRayedShine(ctx context.Context, uid string, shineId string) (bool, error) {
	var count int
	count, err := s.db.WithContext(ctx).Model(&RayData{}).Where(`"shineId" = ?`, shineId).Where("uid = ?", uid).Count()
	log.Printf("count of rays: %v", count)
	if err != nil && err != pg.ErrNoRows {
		return false, fmt.Errorf("error while checking if user %s rayed shine: %v", uid, err)
	}
	return count > 0, nil
}
