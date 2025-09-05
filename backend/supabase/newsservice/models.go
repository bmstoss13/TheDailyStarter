package newsservice

import "time"

type NewsData struct {
	tableName struct{} `pg:"news"`

	Id             string    `pg:"id" json:"id"`
	CreatedAt      time.Time `pg:"created_at" json:"createdAt"`
	Title          string    `pg:"title" json:"title"`
	Description    string    `pg:"description" json:"description"`
	ImageUrl       string    `pg:"image_url" json:"imageUrl"`
	SourceUrl      string    `pg:"source_url" json:"sourceUrl"`
	SourceName     string    `pg:"source_name" json:"sourceName"`
	SentimentScore float32   `pg:"sentiment_score" json:"sentimentScore"`
}

const newsTableName = "news"
