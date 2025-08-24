package shineservice

import "time"

type ShineData struct {
	ID            string    `firebase:"id"`
	Text          string    `firebase:"text"`
	Username      string    `firebase:"username"`
	UID           string    `firebase:"uid"`
	CreatedAt     time.Time `firebase:"createdAt"`
	RayCount      uint      `firebase:"rayCount"`
	MediaURL      string    `firebase:"mediaURL,omitempty"`
	UserPhotoURL  string    `firebase:"userPhotoUrl,omitempty"`
	CommentNumber uint32    `firebase:"commentNumber"`
}

//extends ShineData with ray status
type ShineDataWithRayStatus struct {
	ShineData
	HasRayed bool `firebase:"hasRayed"`
}

type RayData struct {
	Timestamp time.Time `firebase:"timestamp"`
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
