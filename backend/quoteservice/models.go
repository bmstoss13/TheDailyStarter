package quoteservice

type DailyQuote struct {
	Author string `firestore:"a"`
	Quote  string `firestore:"q"`
	Date   string `firestore:"date"`
}

const (
	quotesCollection = "quotes"
)

// type QuoteError struct {
// 	Message string
// }

// func (e *QuoteError) Error() string {
// 	return e.Message
// }

// var (
// 	ErrUsernameTaken     = &QuoteError{Message: "Username already taken. Please choose a different one."}
// 	ErrUserProfileExists = &QuoteError{Message: "User profile already exists for this ID. Cannot create new one."}
// 	ErrUserNotFound      = &QuoteError{Message: "User not found."}
// )
