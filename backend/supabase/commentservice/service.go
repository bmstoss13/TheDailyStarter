package commentservice

import (
	"context"
	"fmt"
	"log"
	SupabaseShines "services/supabase/shineservice"
	SupabaseUsers "services/supabase/userservice"
	"time"

	"github.com/go-pg/pg/v10"
	"github.com/google/uuid"
)

type Service struct {
	db           *pg.DB
	userService  *SupabaseUsers.SupabaseService
	shineService *SupabaseShines.Service
}

func NewService(db *pg.DB, userSvc *SupabaseUsers.SupabaseService, shineSvc *SupabaseShines.Service) *Service {
	return &Service{
		db:           db,
		userService:  userSvc,
		shineService: shineSvc,
	}
}

// creating a shine comment given uid, shine ID, parent ID (not passed in as it is a comment.), and text
func (s *Service) CreateComment(ctx context.Context, uid string, shineId string, text string) (*Comment, error) {
	if text == "" {
		log.Printf("failed to create comment as comments must have text.")
		return nil, fmt.Errorf("comments must have text")
	}

	id := uuid.NewString()

	newComment := &Comment{
		ID:         id,
		UID:        uid,
		ShineId:    shineId,
		CreatedAt:  time.Now(),
		Text:       text,
		RayCount:   0,
		ReplyCount: 0,
	}

	_, err := s.db.WithContext(ctx).Model(newComment).Returning("*").Insert()
	if err != nil {
		log.Printf("An error occurred while creating comment: %v", err)
		return nil, fmt.Errorf("error while creating shine: %v", err)
	}

	_, countErr := s.db.WithContext(ctx).Model(&SupabaseShines.ShineData{}).Where("id = ?", shineId).Set(`"commentNumber" = "commentNumber" + 1`).Update()
	if countErr != nil {
		log.Printf("An error occurred while updating the number of comments on shine %v: %v", shineId, countErr)
		return nil, fmt.Errorf("error while updating comment number on this shine: %v", err)
	}

	log.Printf("New comment, %s, added by %s to collection ", newComment.ID, uid)
	return newComment, nil
}

// fetch comments from db for given shine given limit
func (s *Service) GetComments(ctx context.Context, limit int, startAfterCommentId string, uid string, shineId string) ([]CommentsWithRayData, error) {
	var comments []CommentsWithRayData

	query := s.db.WithContext(ctx).Model((*Comment)(nil)).
		// TableExpr("comments AS comment").
		ColumnExpr("comment.*").
		ColumnExpr(`UserProfileData.username AS username, UserProfileData."photoURL" AS "userPhotoUrl"`).
		Join("LEFT JOIN ? AS UserProfileData ON UserProfileData.uid = comment.uid", pg.Ident(SupabaseUsers.UserProfileTableName)).
		Join("LEFT JOIN ? AS CommentRays ON CommentRays.comment_id = comment.id AND CommentRays.uid = ?", pg.Ident(CommentRayTable), uid).
		ColumnExpr("CommentRays.uid IS NOT NULL AS has_rayed").
		Where("comment.shine_id = ?", shineId).
		OrderExpr("comment.ray_count DESC").
		OrderExpr("comment.created_at DESC")

	if startAfterCommentId != "" {
		var startAfterComment Comment
		err := s.db.Model(&startAfterComment).Where("id = ?", startAfterCommentId).Select()
		if err != nil {
			log.Printf("start after comment id %s not found", startAfterCommentId)
		} else {
			query.Where(`comment.created_at < ? OR (comment.created_at = ? AND comment.id < ?)`, startAfterComment.CreatedAt, startAfterComment.CreatedAt, startAfterComment.ID)
			log.Printf("Queried new comments.")
		}
	}

	query.Limit(limit)

	if err := query.Select(&comments); err != nil {
		log.Printf("an error occurred while getting comments: %v", err)
		return nil, fmt.Errorf("failed to fetch comments: %w", err)
	}

	log.Printf("Fetched %d comments.", len(comments))
	return comments, nil
}

// comment owners and admins can delete comments, along with replies or rays tethered to it.
func (s *Service) DeleteComment(ctx context.Context, uid string, commentId string, parentId string) error {
	var comment Comment
	err := s.db.WithContext(ctx).Model(&comment).Where("id = ?", commentId).Select()
	if err != nil {
		if err == pg.ErrNoRows {
			return fmt.Errorf("comment does not exist")
		}
		log.Printf("Failed to get comment for deletion: %v", err)
		return fmt.Errorf("internal server error")
	}

	isOwner := comment.UID == uid
	isAdmin, err := s.userService.IsAdmin(ctx, uid)
	if err != nil {
		return fmt.Errorf("failed to verify admin status: %w", err)
	}
	if !isOwner && !isAdmin {
		log.Printf("User %s is not authorized to delete comment %s.", uid, commentId)
		return fmt.Errorf("unauthorized to delete this comment")
	}

	_, err = s.db.WithContext(ctx).Model(&comment).Where("id = ?", commentId).Delete()
	if err != nil {
		log.Printf("Failed to delete comment, %v: %v", commentId, err)
		return fmt.Errorf("failed to delete comment")
	}
	return nil
}

// get the comment, marshal onto new comment struct var, send updates to comment, return nil
func (s *Service) UpdateComment(ctx context.Context, uid string, commentId string, updates map[string]interface{}) error {
	var comment Comment
	err := s.db.WithContext(ctx).Model(&comment).Where("id = ?", commentId).Select()
	if err != nil {
		if err == pg.ErrNoRows {
			return fmt.Errorf("comment does not exist")
		}
		log.Printf("Failed to marshal comment data from supabase: %v", err)
		return fmt.Errorf("failed to retreive comment from db")
	}

	if comment.UID != uid {
		log.Printf("User %s is not authorized to update comment %s.", uid, commentId)
		return fmt.Errorf("unauthorized to update this comment")
	}

	_, updateErr := s.db.WithContext(ctx).Model(&comment).WherePK().Set("text = ?", updates["text"]).Update()
	if updateErr != nil {
		log.Printf("an error occurred while updating comment: %v", err)
		return fmt.Errorf("failed to update comment")
	}
	return nil
}

func (s *Service) ToggleCommentRay(ctx context.Context, uid string, commentId string) (bool, error) {
	rayAdded := false
	err := s.db.RunInTransaction(ctx, func(tx *pg.Tx) error {
		var existingRay CommentRay
		err := tx.Model(&existingRay).Where("comment_id = ?", commentId).Where("uid = ?", uid).Select()
		if err != nil && err != pg.ErrNoRows {
			return fmt.Errorf("failed to check for existing ray: %w", err)
		}

		var comment Comment
		commentErr := tx.Model(&comment).Where("id = ?", commentId).Select()
		if commentErr != nil {
			return fmt.Errorf("failed to retrieve comment from supabase: %w", err)
		}

		commenterId := comment.UID
		//if ray does not exist for user
		if err == pg.ErrNoRows {
			newRay := &CommentRay{
				UID:       uid,
				CommentId: commentId,
				CreatedAt: time.Now(),
			}

			_, insertErr := tx.Model(newRay).Insert()
			if insertErr != nil {
				log.Printf("an error occurred while adding new ray: %v", err)
				return fmt.Errorf("failed to insert new ray: %w", err)
			}

			_, updateErr := tx.Model(&Comment{}).Where("id = ?", commentId).Set("ray_count = ray_count + 1").Update()
			if updateErr != nil {
				log.Printf("an error occurred while incrementing ray count: %v", err)
				return fmt.Errorf("failed to increment ray count: %w", err)
			}

			_, addErr := tx.Model(&SupabaseUsers.UserProfileData{}).Where("uid = ?", commenterId).Set(`"rayCount" = "rayCount" + 1`).Update()
			if addErr != nil {
				log.Printf("an error occurred while incrementing ray count for user: %v", err)
				return fmt.Errorf("failed to increment ray count for user: %w", err)
			}
			rayAdded = true
			//if ray current exists from user
		} else {

			_, deleteErr := tx.Model(&existingRay).Where("comment_id = ?", commentId).Where("uid = ?", uid).Delete()
			if deleteErr != nil {
				log.Printf("an error occurred while deleting ray: %v", err)
				return fmt.Errorf("failed to delete ray from comment: %w", err)
			}

			_, updateErr := tx.Model(&Comment{}).Where("id = ?", commentId).Set("ray_count = ray_count - 1").Update()
			if updateErr != nil {
				log.Printf("an error occurred while decrementing ray count on comment: %v", err)
				return fmt.Errorf("failed to decrement ray count on comment: %w", err)
			}

			_, countErr := tx.Model(&SupabaseUsers.UserProfileData{}).Where("uid = ?", uid).Set(`"rayCount" = "rayCount" - 1`).Update()
			if countErr != nil {
				log.Printf("an error occurred while decrementing user ray count: %v", err)
				return fmt.Errorf("failed to decrement user ray count: %w", err)
			}
			rayAdded = false

		}
		return nil
	})
	if err != nil {
		log.Printf("An error occurred while toggling ray for comment: %v", err)
		return false, fmt.Errorf("error toggling ray: %w", err)
	}
	return rayAdded, nil
}

// check if user has rayed comment by retrieving count of rays from user. If count > 0, true. Else, false.
func (s *Service) HasUserRayedComment(ctx context.Context, uid string, commentId string) (bool, error) {
	var count int
	count, err := s.db.WithContext(ctx).Model(&CommentRay{}).Where("comment_id = ?", commentId).Where("uid = ?", uid).Count()
	if err != nil && err != pg.ErrNoRows {
		log.Printf("An error occurred while checking if user has toggled ray on comment, %s: %v", commentId, err)
		return false, fmt.Errorf("error checking if user has toggled ray on comment: %w", err)
	}
	return count > 0, nil
}
