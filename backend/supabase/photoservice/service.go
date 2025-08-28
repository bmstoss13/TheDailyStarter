package SupabasePhotos

import (
	"context"
	"fmt"
	"io"
	"log"
	"strings"
	"time"

	"cloud.google.com/go/storage"
	"github.com/go-pg/pg/v10"
	"github.com/google/uuid"
)

type SupabaseService struct {
	dbClient      *pg.DB
	storageClient *storage.Client
}

func NewSupabaseService(db *pg.DB, storageClient *storage.Client) *SupabaseService {
	return &SupabaseService{
		dbClient:      db,
		storageClient: storageClient,
	}
}

func (s *SupabaseService) UploadAndStorePhotoSupabase(ctx context.Context, uid string, fileContent io.Reader, fileName string, contentType string) (*PhotoData, error) {
	uniqueFileName := fmt.Sprintf("%s_%s", uuid.New().String(), fileName)
	objectPath := fmt.Sprintf("users/%s/profile-photos/%s", uid, uniqueFileName)
	photoBucket, err := GetBucket()
	if err != nil {
		return nil, fmt.Errorf("an error occurred while retreiving bucket ID: %v", err)
	}

	writer := s.storageClient.Bucket(photoBucket).Object(objectPath).NewWriter(ctx)

	writer.ContentType = contentType
	writer.ACL = []storage.ACLRule{
		{Entity: storage.AllUsers, Role: storage.RoleReader},
	}

	if _, err := io.Copy(writer, fileContent); err != nil {
		writer.Close()
		return nil, fmt.Errorf("error writing file to storage writer: %w", err)
	}

	if err := writer.Close(); err != nil {
		return nil, fmt.Errorf("error closing storage writer: %w", err)
	}

	url := fmt.Sprintf("https://storage.googleapis.com/%s/%s", photoBucket, objectPath)
	log.Printf("Successfully uploaded photo: %s", url)

	photo := &PhotoData{
		ID:         uuid.NewString(),
		URL:        url,
		FileName:   fileName,
		UploadedBy: uid,
		CreatedAt:  time.Now(),
	}

	_, err = s.dbClient.Model(&photo).Insert()
	if err != nil {
		return nil, fmt.Errorf("error storing photo metadata in Supabase: %w", err)
	}
	log.Printf("Successfully stored photo metadata in Supabase with ID: %s", photo.ID)
	return photo, nil
}

func (s *SupabaseService) GetPhotosForUserSupabase(ctx context.Context, uid string) ([]*PhotoData, error) {
	var photos []*PhotoData
	err := s.dbClient.Model(&photos).
		Where("uploadedBy = ?", uid).
		Select()
	if err != nil {
		return nil, fmt.Errorf("error fetching photos for user %s: %w", uid, err)
	}

	if len(photos) == 0 {
		log.Printf("No photos found for user: %s", uid)
	}

	return photos, nil
}

func (s *SupabaseService) GetSinglePhotoForUserSupabase(ctx context.Context, uid string, photoId string) (*PhotoData, error) {
	var photo PhotoData
	err := s.dbClient.Model(&photo).
		Where("id = ?", photoId).
		Where("uploadedBy=?", uid).
		Select()

	if err != nil {
		return nil, fmt.Errorf("error fetching photo with ID %s: %w", photoId, err)
	}
	return &photo, nil
}

func (s *SupabaseService) DeleteSinglePhotoForUser(ctx context.Context, uid string, photoId string) error {
	var photo PhotoData
	err := s.dbClient.Model(&photo).
		Where("id = ?", photoId).
		Where("uploadedBy = ?", uid).
		Select()

	if err != nil {
		return fmt.Errorf("error finding photo to delete: %w", err)
	}

	parts := strings.SplitN(photo.URL, "/", 5)
	if len(parts) < 5 {
		return fmt.Errorf("invalid photo URL format: %s", photo.URL)
	}
	objectPath := parts[4]

	photoBucket, err := GetBucket()
	if err != nil {
		return fmt.Errorf("error retrieving bucket ID: %v", err)
	}

	objectRef := s.storageClient.Bucket(photoBucket).Object(objectPath)
	if err := objectRef.Delete(ctx); err != nil {
		return fmt.Errorf("error deleting photo from storage: %w", err)
	}

	_, err = s.dbClient.Model(&photo).
		Where("id = ?", photoId).
		Delete()

	if err != nil {
		return fmt.Errorf("error deleting photo metadata from Supabase: %w", err)
	}

	log.Printf("Successfully deleted photo %s for user %s", photoId, uid)
	return nil
}

func (s *SupabaseService) EditPhoto(ctx context.Context, uid string, photoId string, fileContent io.Reader, fileName string, contentType string) (*PhotoData, error) {

	var oldPhoto PhotoData
	err := s.dbClient.Model(&oldPhoto).
		Where("id = ?", photoId).
		Where("uploadedNy = ?", uid).
		Select()

	if err != nil {
		return nil, fmt.Errorf("failed to get existing photo document: %w", err)
	}

	parts := strings.SplitN(oldPhoto.URL, "/", 5)
	if len(parts) < 5 {
		return nil, fmt.Errorf("invalid old photo URL format: %s", oldPhoto.URL)
	}
	oldObjectPath := parts[4]

	photoBucket, err := GetBucket()
	if err != nil {
		return nil, fmt.Errorf("error retrieving bucket ID: %v", err)
	}

	oldObjectRef := s.storageClient.Bucket(photoBucket).Object(oldObjectPath)
	if err := oldObjectRef.Delete(ctx); err != nil {
		log.Printf("Warning: Failed to delete old photo from storage: %v", err)
	}

	uniqueFileName := fmt.Sprintf("%s_%s", uuid.New().String(), fileName)
	newObjectPath := fmt.Sprintf("users/%s/profile-photos/%s", uid, uniqueFileName)

	writer := s.storageClient.Bucket(photoBucket).Object(newObjectPath).NewWriter(ctx)
	writer.ContentType = contentType
	writer.ACL = []storage.ACLRule{
		{Entity: storage.AllUsers, Role: storage.RoleReader},
	}

	if _, err := io.Copy(writer, fileContent); err != nil {
		writer.Close()
		return nil, fmt.Errorf("error writing new file to storage: %w", err)
	}
	if err := writer.Close(); err != nil {
		return nil, fmt.Errorf("error closing new storage writer: %w", err)
	}

	newURL := fmt.Sprintf("https://storage.googleapis.com/%s/%s", photoBucket, newObjectPath)

	newPhotoData := &PhotoData{
		ID:         oldPhoto.ID,
		URL:        newURL,
		FileName:   fileName,
		UploadedBy: uid,
		CreatedAt:  time.Now(),
	}
	_, err = s.dbClient.Model(newPhotoData).
		Where("id = ?", oldPhoto.ID).
		Update()

	if err != nil {
		return nil, fmt.Errorf("error updating Supabase document: %w", err)
	}

	log.Printf("Successfully updated photo %s for user %s", photoId, uid)
	return newPhotoData, nil
}
