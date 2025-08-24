package helpers

import (
	"context"
	"net/http"
	"strings"

	firebaseAuth "firebase.google.com/go/v4/auth"
)

// TokenAuthorizer is a middleware that validates an ID token and adds the UID to the request context.
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
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}

			// Add the UID to the request context to be used by other handlers
			ctx := context.WithValue(r.Context(), "uid", decodedToken.UID)
			r = r.WithContext(ctx)

			next.ServeHTTP(w, r)
		})
	}
}
