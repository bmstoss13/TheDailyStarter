package firebaseService

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strings"

	"cloud.google.com/go/firestore"
	"cloud.google.com/go/storage"
	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"github.com/go-pg/pg/v10"

	// supabase "github.com/francoisdtm/supabase-go"
	"google.golang.org/api/option"
)

type Clients struct {
	App       *firebase.App
	Auth      *auth.Client
	Firestore *firestore.Client
	Storage   *storage.Client
	DB        *pg.DB
}

func Init(ctx context.Context) (*Clients, error) {

	privateKey := os.Getenv("FIREBASE_ADMIN_PRIVATE_KEY")
	clientEmail := os.Getenv("FIREBASE_ADMIN_CLIENT_EMAIL")
	projectID := os.Getenv("FIREBASE_ADMIN_PROJECT_ID")

	// supabaseURL := os.Getenv("SUPABASE_DATABASE_URL")
	// supabaseKey := os.Getenv("SUPABASE_SERVICE_ROLE_KEY")

	supabaseDBURL := os.Getenv("SUPABASE_DATABASE_URL")
	if supabaseDBURL == "" {
		return nil, fmt.Errorf("SUPABASE_DATABASE_URL environment variable is not set")
	}

	// Connect to the Supabase PostgreSQL database using go-pg
	opt, err := pg.ParseURL(supabaseDBURL)
	if err != nil {
		return nil, fmt.Errorf("failed to parse Supabase database URL: %w", err)
	}

	db := pg.Connect(opt)
	if err := db.Ping(ctx); err != nil {
		return nil, fmt.Errorf("failed to connect to Supabase database: %w", err)
	}

	if privateKey == "" || clientEmail == "" || projectID == "" {
		return nil, fmt.Errorf("required Firebase environment variables (FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, FIREBASE_PROJECT_ID) are not set")
	}

	privateKey = strings.Replace(privateKey, "\\n", "\n", -1)

	credsJSON := map[string]string{
		"type":         "service_account",
		"project_id":   projectID,
		"private_key":  privateKey,
		"client_email": clientEmail,
	}

	credsBytes, err := json.Marshal(credsJSON)
	if err != nil {
		return nil, fmt.Errorf("error marshalling credentials JSON: %w", err)
	}

	sa := option.WithCredentialsJSON(credsBytes)

	app, err := firebase.NewApp(ctx, nil, sa)
	if err != nil {
		return nil, fmt.Errorf("error initializing Firebase app: %w", err)
	}

	authClient, err := app.Auth(ctx)
	if err != nil {
		return nil, fmt.Errorf("error getting Auth client: %w", err)
	}

	firestoreClient, err := app.Firestore(ctx)
	if err != nil {
		return nil, fmt.Errorf("error getting Firestore client: %w", err)
	}

	storageClient, err := storage.NewClient(ctx, sa)
	if err != nil {
		return nil, fmt.Errorf("error getting Storage client: %w", err)
	}

	return &Clients{
		App:       app,
		Auth:      authClient,
		Firestore: firestoreClient,
		Storage:   storageClient,
		DB:        db,
	}, nil
}

func (c *Clients) Close() error {
	if c.Firestore != nil {
		if err := c.Firestore.Close(); err != nil {
			return err
		}
	}
	if c.Storage != nil {
		if err := c.Storage.Close(); err != nil {
			return err
		}
	}

	if c.DB != nil {
		if err := c.DB.Close(); err != nil {
			return err
		}
	}
	return nil
}
