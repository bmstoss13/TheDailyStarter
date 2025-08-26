package photoservice

import (
	"context"
	"fmt"
	"io"
	"log"
	"os"
	"strings"
	"time"

	"cloud.google.com/go/firestore"
	"cloud.google.com/go/storage"
	"github.com/google/uuid"
	"google.golang.org/api/iterator"
)

type Service struct {
	firestoreClient *firestore.Client
	storageClient   *storage.Client
}

func NewService(firestoreClient *firestore.Client, storageClient *storage.Client) *Service {
	return &Service{
		firestoreClient: firestoreClient,
		storageClient:   storageClient,
	}
}

func GetProjectId() string {
	projectId := os.Getenv("FIREBASE_ADMIN_PROJECT_ID")
	if projectId == "" {
		log.Printf("Project ID is required. Using empty string instead")
	}

	return projectId
}

func (s *Service) FetchPhotoData(uid string, photoId string) *firestore.DocumentRef {
	return s.firestoreClient.Collection("artifacts").Doc(GetProjectId()).Collection("users").Doc(uid).Collection(PhotoCollection).Doc(photoId)
}

func (s *Service) UploadAndStorePhoto(ctx context.Context, uid string, fileContent io.Reader, fileName string, contentType string) (*PhotoData, error) {

	uniqueFileName := fmt.Sprintf("%s_%s", uuid.New().String(), fileName)
	objectPath := fmt.Sprintf("users/%s/profile-photos/%s", uid, uniqueFileName)
	photoBucket, err := GetBucket()
	if err != nil {
		return nil, fmt.Errorf("an error occurred while retrieving bucket id: %v", err)
	}

	writer := s.storageClient.Bucket(photoBucket).Object(objectPath).NewWriter(ctx)

	writer.ContentType = contentType
	writer.ACL = []storage.ACLRule{
		{Entity: storage.AllUsers, Role: storage.RoleReader},
	}

	if _, err := io.Copy(writer, fileContent); err != nil {
		writer.Close()
		return nil, fmt.Errorf("error writing file to storage: %w", err)
	}

	if err := writer.Close(); err != nil {
		return nil, fmt.Errorf("error closing storage writer: %w", err)
	}

	url := fmt.Sprintf("https://storage.googleapis.com/%s/%s", photoBucket, objectPath)
	log.Printf("Successfully uploaded photo: %s", url)

	photoData := &PhotoData{
		URL:        url,
		FileName:   fileName,
		UploadedBy: uid,
		CreatedAt:  time.Now(),
	}

	projectID := GetProjectId()
	docRef, _, err := s.firestoreClient.Collection("artifacts").Doc(projectID).Collection("users").Doc(uid).Collection("photos").Add(ctx, photoData)

	if err != nil {
		return nil, fmt.Errorf("error storing photo metadata in Firestore: %w", err)
	}

	log.Printf("Successfully stored photo metadata in Firestore with id: %s", docRef.ID)
	return photoData, nil
}

func (s *Service) GetPhotosForUser(ctx context.Context, uid string) ([]*PhotoData, error) {
	photoRef := s.firestoreClient.Collection("artifacts").Doc(GetProjectId()).Collection("users").Doc(uid).Collection(PhotoCollection)
	snapshotIter := photoRef.OrderBy("createdAt", firestore.Desc).Documents(ctx)

	photos := make([]*PhotoData, 0)
	for {
		doc, err := snapshotIter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, fmt.Errorf("error iterating over documents: %w", err)
		}

		var photo PhotoData
		if err := doc.DataTo(&photo); err != nil {
			return nil, fmt.Errorf("error unmarshalling photo data: %w", err)
		}
		photos = append(photos, &photo)
	}

	if len(photos) == 0 {
		log.Printf("No photos found for user: %s", uid)
	}
	return photos, nil
}

func (s *Service) GetSinglePhotoForUser(ctx context.Context, uid string, photoId string) (*PhotoData, error) {
	photoRef := s.FetchPhotoData(uid, photoId)
	snapshot, err := photoRef.Get(ctx)
	if err != nil {
		return nil, fmt.Errorf("error getting snapshot of document with photo id %v: %w", photoRef.ID, err)
	}
	var photo PhotoData
	if err := snapshot.DataTo(&photo); err != nil {
		return nil, fmt.Errorf("error unmarshalling single photo data: %w", err)
	}
	return &photo, nil
}

func (s *Service) DeleteSinglePhotoForUser(ctx context.Context, uid string, photoId string) error {
	photoRef := s.FetchPhotoData(uid, photoId)
	snapshot, err := photoRef.Get(ctx)
	if err != nil {
		log.Printf("Failed to get photo document: %v", err)
		return fmt.Errorf("error getting photo document to delete")
	}

	var photo PhotoData
	if err := snapshot.DataTo(&photo); err != nil {
		return fmt.Errorf("error while unmarshaling photo data: %v", err)
	}

	if photo.UploadedBy != uid {
		return fmt.Errorf("unauthorized: only the owner has access")
	}

	parts := strings.SplitN(photo.URL, "/", 5)
	if len(parts) < 5 {
		return fmt.Errorf("invalid photo URL format: %s", photo.URL)
	}
	objectPath := parts[4]

	photoBucket, err := GetBucket()
	if err != nil {
		return fmt.Errorf("an error occurred while retrieving bucket id: %v", err)
	}

	objectRef := s.storageClient.Bucket(photoBucket).Object(objectPath)
	if err := objectRef.Delete(ctx); err != nil {
		log.Printf("Failed to delete photo from storage: %v", err)
		return fmt.Errorf("error deleting photo from storage")
	}

	if _, err := photoRef.Delete(ctx); err != nil {
		log.Printf("Failed to delete photo document: %v", err)
		return fmt.Errorf("error deleting photo metadata from Firestore")
	}

	log.Printf("Successfully deleted photo %s for user %s", photoId, uid)
	return nil
}

func (s *Service) EditPhoto(ctx context.Context, uid string, photoId string, fileContent io.Reader, fileName string, contentType string) (*PhotoData, error) {

	photoRef := s.FetchPhotoData(uid, photoId)

	snapshot, err := photoRef.Get(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get existing photo document: %w", err)
	}

	var oldPhoto PhotoData
	if err := snapshot.DataTo(&oldPhoto); err != nil {
		return nil, fmt.Errorf("error unmarshalling old photo data: %w", err)
	}

	if oldPhoto.UploadedBy != uid {
		return nil, fmt.Errorf("unauthorized: only the owner can edit this photo")
	}

	uniqueFileName := fmt.Sprintf("%s_%s", uuid.New().String(), fileName)
	newObjectPath := fmt.Sprintf("users/%s/profile-photos/%s", uid, uniqueFileName)

	photoBucket, err := GetBucket()
	if err != nil {
		return nil, fmt.Errorf("an error occurred while retrieving bucket id: %v", err)
	}

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

	updates := []firestore.Update{
		{Path: "url", Value: newURL},
		{Path: "fileName", Value: fileName},
		{Path: "createdAt", Value: firestore.ServerTimestamp},
	}
	if _, err := photoRef.Update(ctx, updates); err != nil {
		return nil, fmt.Errorf("error updating Firestore document: %w", err)
	}

	oldParts := strings.SplitN(oldPhoto.URL, "/", 5)
	if len(oldParts) < 5 {
		log.Printf("Warning: Invalid old photo URL format: %s. Could not delete old photo from storage.", oldPhoto.URL)
	} else {
		oldObjectPath := oldParts[4]
		oldObjectRef := s.storageClient.Bucket(photoBucket).Object(oldObjectPath)
		if err := oldObjectRef.Delete(ctx); err != nil {
			log.Printf("Warning: Failed to delete old photo from storage: %v", err)
		}
	}

	log.Printf("Successfully updated photo %s for user %s", photoId, uid)

	newPhotoData := &PhotoData{
		URL:        newURL,
		FileName:   fileName,
		UploadedBy: uid,
	}

	return newPhotoData, nil
}
