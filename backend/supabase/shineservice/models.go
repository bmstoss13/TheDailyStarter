package SupabaseShines

import "time"

type ShineData struct {
	tableName     struct{}  `pg:"shines"`
	ID            string    `pg:"id,pk" json:"id"`
	Text          string    `pg:"text" json:"text"`
	UID           string    `pg:"uid" json:"uid"`
	CreatedAt     time.Time `pg:"createdAt" json:"createdAt"`
	RayCount      int       `pg:"rayCount" json:"rayCount"`
	MediaURL      string    `pg:"mediaURL" json:"mediaURL,omitempty"`
	CommentNumber int       `pg:"commentNumber" json:"commentNumber"`
}

// You would use a joined struct to handle the user data
type ShineWithUserData struct {
	ShineData
	Username     string `pg:"username" json:"username"`
	UserPhotoURL string `pg:"photo_url" json:"userPhotoUrl,omitempty"`
}

type RayData struct {
	Timestamp time.Time `pg:"timestamp" json:"timestamp"`
}

const (
	ShineCollection  = "shines"
	RaySubcollection = "rays"
)

type ShineError struct {
	Message string
}

func (e *ShineError) Error() string {
	return e.Message
}
