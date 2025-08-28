package SupabaseShines

import "time"

// ShineData maps to the 'shines' table in Supabase.
// It uses camelCase 'pg' tags to match your database column names.
type ShineData struct {
	tableName struct{} `pg:"shines"`
	ID        string   `pg:"id,pk" json:"id"`
	Text      string   `pg:"text" json:"text"`
	// UID is a foreign key referencing the user's ID.
	UID           string    `pg:"uid" json:"uid"`
	CreatedAt     time.Time `pg:"createdAt" json:"createdAt"`
	RayCount      int       `pg:"rayCount" json:"rayCount"`
	MediaURL      string    `pg:"mediaURL" json:"mediaURL,omitempty"`
	CommentNumber int       `pg:"commentNumber" json:"commentNumber"`
}

// RayData maps to the separate 'rays' table in Supabase.
// This table tracks which user has "rayed" which shine.
type RayData struct {
	tableName struct{} `pg:"rays"`
	// ID is a composite primary key to ensure uniqueness.
	UID       string    `pg:"uid,pk" json:"uid"`
	ShineID   string    `pg:"shineId,pk" json:"shineId"`
	CreatedAt time.Time `pg:"createdAt" json:"createdAt"`
}

// ShineDataWithUserData is a composite struct used for database joins.
// It is NOT a database table itself. It combines ShineData with
// selected fields from the 'user_profile_data' table for display.
type ShineDataWithUserData struct {
	ShineData
	Username     string `pg:"username" json:"username"`
	UserPhotoURL string `pg:"userPhotoUrl" json:"userPhotoUrl,omitempty"`
}

// ShineDataWithRayStatus is a composite struct for the final API response.
// It combines the core shine data with a flag indicating if the current user
// has "rayed" it. It is also NOT a database table.
type ShineDataWithRayStatus struct {
	tableName struct{} `pg:"-"`
	ShineDataWithUserData
	HasRayed bool `pg:"hasRayed" json:"hasRayed"`
}

type ShineError struct {
	Message string
}

func (e *ShineError) Error() string {
	return e.Message
}

const RayTable = "rays"
