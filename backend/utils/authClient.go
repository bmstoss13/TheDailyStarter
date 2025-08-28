package helpers

import (
	"context"
	"log"
	"net/http"
	"strings"

	sharedCtx "services/utils/context"

	firebaseAuth "firebase.google.com/go/v4/auth"
)

// Define context keys as constants to prevent issues with string literal mismatches.
type contextKey string

const (
	UIDKey   contextKey = "uid"
	EmailKey contextKey = "email"
)

// TokenAuthorizer is a middleware that validates a Firebase ID token and
// adds the UID and Email to the request context.
func TokenAuthorizer(authClient *firebaseAuth.Client) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}

			idToken := strings.TrimPrefix(authHeader, "Bearer ")
			decodedToken, err := authClient.VerifyIDToken(r.Context(), idToken)
			if err != nil {
				log.Printf("Failed to verify ID token: %v", err)
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}

			// Add the UID and Email to the request context using the defined constants.
			ctx := context.WithValue(r.Context(), sharedCtx.UIDKey, decodedToken.UID)

			// The 'email' claim is a string, and it may not always be present, so we check for it.
			if email, ok := decodedToken.Claims["email"].(string); ok {
				ctx = context.WithValue(ctx, sharedCtx.EmailKey, email)
			} else {
				// Log a warning if the email claim is missing or invalid.
				log.Println("Warning: Email claim not found in token.")
				// Optionally, set an empty string to avoid a nil value in the context.
				ctx = context.WithValue(ctx, sharedCtx.EmailKey, "")
			}

			// Pass the new context to the next handler in the chain.
			r = r.WithContext(ctx)

			next.ServeHTTP(w, r)
		})
	}
}
