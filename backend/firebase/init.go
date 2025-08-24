package firebaseService

import (
	"context"
	"log"
	"os"

	"cloud.google.com/go/firestore"
	"cloud.google.com/go/storage"
	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
)

type Clients struct {
	App       *firebase.App
	GCS       *storage.Client
	Auth      *auth.Client
	Firestore *firestore.Client
}

func Init(ctx context.Context) (*Clients, error) {
	proj := os.Getenv("FIREBASE_PROJECT_ID")
	log.Printf("Project ID: %v", proj)
	if proj == "" {
		proj = "the-daily-starter"
	}

	app, err := firebase.NewApp(ctx, &firebase.Config{ProjectID: proj})
	if err != nil {
		return nil, err
	}

	gcs, err := storage.NewClient(ctx)
	if err != nil {
		return nil, err
	}

	authClient, err := app.Auth(ctx)
	if err != nil {
		return nil, err
	}

	firestoreClient, err := app.Firestore(ctx)
	if err != nil {
		return nil, err
	}

	return &Clients{
		App:       app,
		GCS:       gcs,
		Auth:      authClient,
		Firestore: firestoreClient,
	}, nil
}

func (c *Clients) Close() error {
	if c.GCS != nil {
		if err := c.GCS.Close(); err != nil {
			return err
		}
	}

	if c.Firestore != nil {
		if err := c.Firestore.Close(); err != nil {
			return err
		}
	}
	return nil
}
