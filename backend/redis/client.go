package redisclient

import (
	"context"
	"log"
	"os"

	"github.com/redis/go-redis/v9"
)

type Client struct {
	*redis.Client
}

// Set up redis client
func NewClient(ctx context.Context) *Client {

	redisURL := os.Getenv("REDIS_URL")
	if redisURL == "" {
		log.Fatal("REDIS_URL environment variable is not set")
	}

	options, err := redis.ParseURL(redisURL)
	if err != nil {
		log.Fatalf("could not parse Redis URL: %v", err)
	}

	client := redis.NewClient(options)

	if _, err := client.Ping(ctx).Result(); err != nil {
		log.Fatalf("could not connect to Redis: %v", err)
	}

	log.Println("Successfull connected to Redis.")

	return &Client{client}
}

func (c *Client) Close() {
	c.Client.Close()
}
