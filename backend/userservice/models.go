package userservice

import (
	"time"
)

type UserProfileData struct {
	UID            string    `firestore:"uid" json:"uid"`
	FirstName      string    `firestore:"firstName" json:"firstName"`
	LastName       string    `firestore:"lastName" json:"lastName"`
	Username       string    `firestore:"username" json:"username"`
	DOB            string    `firestore:"dob" json:"dob"`
	CreatedAt      time.Time `firestore:"createdAt" json:"createdAt"`
	Email          string    `firestore:"email,omitempty" json:"email,omitempty"`
	PhotoURL       string    `firestore:"photoURL,omitempty" json:"photoURL,omitempty"`
	LastQuoteShown string    `firestore:"lastQuoteShown,omitempty" json:"lastQuoteShown,omitempty"`
	QuotesAlbum    string    `firestore:"quotesAlbum,omitempty" json:"quotesAlbum,omitempty"`
	RayCount       string    `firestore:"rayCount" json:"rayCount"`
	IsAdmin        bool      `firestore:"isAdmin" json:"isAdmin"`
}

type Username struct {
	UID       string    `firestore:"uid" json:"uid"`
	Username  string    `firestore:"username" json:"username"`
	CreatedAt time.Time `firestore:"createdAt" json:"createdAt"`
}

type UserSearchResult struct {
	UID      string `firestore:"uid" json:"uid"`
	Username string `firestore:"username" json:"username"`
	PhotoURL string `firestore:"photoURL,omitempty" json:"photoURL,omitempty"`
}

const (
	userCollection     = "users"
	usernameCollection = "usernames"
)

type UserError struct {
	Message string
}

func (e *UserError) Error() string {
	return e.Message
}

var (
	ErrUsernameTaken     = &UserError{Message: "Username already taken. Please choose a different one."}
	ErrUserProfileExists = &UserError{Message: "User profile already exists for this ID. Cannot create new one."}
	ErrUserNotFound      = &UserError{Message: "User not found."}
)
