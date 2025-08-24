package helpers

import (
	"net/http"
	"os"
	"strings"
)

// AllowedOrigins defines the CORS origins based on the environment.
var AllowedOrigins = func() []string {
	if os.Getenv("NODE_ENV") == "development" {
		return []string{"http://localhost:3000"}
	}
	return []string{"http://sunshine.app", "https://the-daily-starter.firebaseapp.com"}
}()

// CorsMiddleware provides a flexible CORS handler.
func CorsMiddleware(allowedMethods []string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Set the Access-Control-Allow-Origin header
			origin := r.Header.Get("Origin")
			isOriginAllowed := false
			for _, allowedOrigin := range AllowedOrigins {
				if origin == allowedOrigin {
					isOriginAllowed = true
					break
				}
			}
			if isOriginAllowed {
				w.Header().Set("Access-Control-Allow-Origin", origin)
			}
			w.Header().Set("Access-Control-Allow-Methods", strings.Join(allowedMethods, ", "))
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

			// Handle preflight OPTIONS requests
			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusOK)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}
