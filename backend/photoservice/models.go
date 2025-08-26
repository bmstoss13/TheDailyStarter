package photoservice

import (
	"os"
	"time"
)

type PhotoData struct {
	URL        string    `firebase:"url" json:"url"`
	FileName   string    `firebase:"fileName" json:"fileName"`
	UploadedBy string    `firebase:"uploadedBy" json:"uploadedBy"`
	CreatedAt  time.Time `firebase:"createdAt" json:"createdAt"`
}

const (
	PhotoCollection = "photos"
)

func GetBucket() (string, error) {
	bucketId := os.Getenv("FIREBASE_STORAGE_BUCKET")
	return bucketId, nil
}
