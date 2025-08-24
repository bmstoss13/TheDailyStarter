package userservice

import (
	"time"
)

type UserProfileData struct {
	UID            string    `firestore:"uid"`
	FirstName      string    `firestore:"firstName"`
	LastName       string    `firestore:"lastName"`
	Username       string    `firestore:"username"`
	DOB            string    `firestore:"dob"`
	CreatedAt      time.Time `firestore:"createdAt"`
	Email          string    `firestore:"email,omitempty"`
	PhotoURL       string    `firestore:"photoURL,omitempty"`
	LastQuoteShown string    `firestore:"lastQuoteShown,omitempty"`
	QuotesAlbum    string    `firestore:"quotesAlbum,omitempty"`
	RayCount       string    `firestore:"rayCount"`
}

type Username struct {
	UID       string    `firestore:"uid"`
	Username  string    `firestore:"username"`
	CreatedAt time.Time `firestore:"createdAt"`
}

type UserSearchResult struct {
	UID      string `firestore:"uid"`
	Username string `firestore:"username"`
	PhotoURL string `firestore:"photoURL,omitempty"`
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
