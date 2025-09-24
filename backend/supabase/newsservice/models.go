package newsservice

import "time"

type NewsData struct {
	tableName struct{} `pg:"news"`

	Id             string    `pg:"id,pk" json:"id"`
	CreatedAt      time.Time `pg:"created_at" json:"createdAt"`
	Title          string    `pg:"title" json:"title"`
	Summary        string    `pg:"summary" json:"summary"`          // The API has a 'summary' field
	ArticleText    string    `pg:"article_text" json:"articleText"` // Mapping API's 'text' field
	ImageUrl       string    `pg:"image_url" json:"imageUrl"`
	SourceUrl      string    `pg:"source_url" json:"sourceUrl"`
	SourceCountry  string    `pg:"source_country" json:"sourceCountry"` // The API returns source country
	SentimentScore float32   `pg:"sentiment_score" json:"sentimentScore"`
	PublishDate    time.Time `pg:"publish_date" json:"publishDate"`
}

const newsTableName = "news"
