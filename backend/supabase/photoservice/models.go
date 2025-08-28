package SupabasePhotos

import (
	"os"
	"time"
)

type PhotoData struct {
	tableName struct{} `pg:"photos"`

	ID         string    `pg:"id,pk" json:"id"`
	URL        string    `pg:"url" json:"url"`
	FileName   string    `pg:"fileName" json:"fileName"`
	UploadedBy string    `pg:"uploadedBy" json:"uploadedBy"`
	CreatedAt  time.Time `pg:"createdAt" json:"createdAt"`
}

const (
	PhotoCollection = "photos"
)

func GetBucket() (string, error) {
	bucketId := os.Getenv("FIREBASE_STORAGE_BUCKET")
	return bucketId, nil
}
