package SupabaseUsers

import (
	"time"
)

type UserProfileData struct {
	tableName struct{} `pg:"users"`

	UID            string          `pg:"uid" json:"uid"`
	FirstName      string          `pg:"firstName" json:"firstName"`
	LastName       string          `pg:"lastName" json:"lastName"`
	Username       string          `pg:"username" json:"username"`
	DOB            string          `pg:"dob" json:"dob"`
	CreatedAt      time.Time       `pg:"createdAt" json:"createdAt"`
	Email          string          `pg:"email" json:"email,omitempty"`
	PhotoURL       string          `pg:"photoURL" json:"photoURL,omitempty"`
	LastQuoteShown string          `pg:"lastQuoteShown" json:"lastQuoteShown,omitempty"`
	QuotesAlbum    []string        `pg:"quotesAlbum,array" json:"quotesAlbum,omitempty"`
	RayCount       int             `pg:"rayCount" json:"rayCount"`
	IsAdmin        bool            `pg:"isAdmin" json:"isAdmin"`
	Bio            string          `pg:"bio" json:"bio"`
	Pronouns       PronounCategory `pg:"pronouns" json:"pronouns"`
	CustomPronouns string          `pg:"customPronouns" json:"customPronouns,omitempty"`
}

type Username struct {
	tableName struct{} `pg:"usernames"`

	UID       string    `pg:"uid" json:"uid"`
	Username  string    `pg:"username" json:"username"`
	CreatedAt time.Time `pg:"createdAt" json:"createdAt"`
}

type UserSearchResult struct {
	tableName struct{} `pg:"users"`
	UID       string   `pg:"uid" json:"uid"`
	Username  string   `pg:"username" json:"username"`
	PhotoURL  string   `pg:"photoURL" json:"photoURL,omitempty"`
}

// const (
// 	userCollection     = "users"
// 	usernameCollection = "usernames"
// )

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

const UserProfileTableName = "users"

type PronounCategory string

const (
	PronounHeHim        PronounCategory = "He/Him"
	PronounSheHer       PronounCategory = "She/Her"
	PronounTheyThem     PronounCategory = "They/Them"
	PronounCustom       PronounCategory = "Custom"
	PronounPreferNotSay PronounCategory = "Prefer not to say"
)
