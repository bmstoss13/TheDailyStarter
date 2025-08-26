package PhotoEndpoint

import (
	"net/http"
	"services/photoservice"
)

func UploadPhotoHandler(svc *photoservice.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method Not Allowed.", http.StatusMethodNotAllowed)
			return
		}
	}
}
