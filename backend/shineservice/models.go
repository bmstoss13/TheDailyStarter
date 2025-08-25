package shineservice

import "time"

type ShineData struct {
	ID            string    `firebase:"id" json:"id"`
	Text          string    `firebase:"text" json:"text"`
	Username      string    `firebase:"username" json:"username"`
	UID           string    `firebase:"uid" json:"uid"`
	CreatedAt     time.Time `firebase:"createdAt" json:"createdAt"`
	RayCount      int       `firebase:"rayCount" json:"rayCount"`
	MediaURL      string    `firebase:"mediaURL,omitempty" json:"mediaURL,omitempty"`
	UserPhotoURL  string    `firebase:"userPhotoUrl,omitempty" json:"userPhotoUrl,omitempty"`
	CommentNumber int       `firebase:"commentNumber" json:"commentNumber"`
}

//extends ShineData with ray status
type ShineDataWithRayStatus struct {
	ShineData
	HasRayed bool `firebase:"hasRayed" json:"hasRayed"`
}

type RayData struct {
	Timestamp time.Time `firebase:"timestamp" json:"timestamp"`
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
