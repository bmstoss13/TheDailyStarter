package commentservice

import "time"

type Comment struct {
	tableName struct{} `pg:"comments"`

	ID         string    `pg:"id,pk" json:"id"`
	UID        string    `pg:"uid" json:"uid"`
	ShineId    string    `pg:"shine_id" json:"shineId"`
	CreatedAt  time.Time `pg:"created_at" json:"createdAt"`
	ParentId   *string   `pg:"parent_id" json:"parentId"` //null for comments
	Text       string    `pg:"text" json:"text"`
	RayCount   int       `pg:"ray_count" json:"rayCount"`
	ReplyCount int       `pg:"reply_count" json:"replyCount"`
}

type CommentRay struct {
	tableName struct{} `pg:"comment_rays"`

	UID       string    `pg:"uid,pk" json:"uid"`
	CommentId string    `pg:"comment_id,pk" json:"commentId"`
	CreatedAt time.Time `pg:"created_at" json:"createdAt"`
}

type CommentDataWithUserData struct {
	tableName struct{} `pg:"-"`

	Comment
	Username     string `pg:"username" json:"username"`
	UserPhotoURL string `pg:"userPhotoUrl" json:"userPhotoUrl,omitempty"`
}

type CommentsWithRayData struct {
	tableName struct{} `pg:"-"`

	CommentDataWithUserData
	HasRayed bool `pg:"has_rayed" json:"hasRayed"`
}

const (
	CommentTable    = "comments"
	CommentRayTable = "comment_rays"
)
