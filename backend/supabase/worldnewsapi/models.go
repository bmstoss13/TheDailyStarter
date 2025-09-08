package worldnewsapi

// import "time"

type Article struct {
	// Basic fields
	ID      string `json:"id"`
	Title   string `json:"title"`
	Text    string `json:"text"`    // The full article text
	Summary string `json:"summary"` // A short summary
	URL     string `json:"url"`
	Image   string `json:"image"`
	Video   string `json:"video"`

	// Metadata
	PublishDate   string   `json:"publish_date"`
	Authors       []string `json:"authors"`
	Category      string   `json:"category"`
	Language      string   `json:"language"`
	SourceCountry string   `json:"source_country"`
	Sentiment     float32  `json:"sentiment"`
}

type Response struct {
	News []Article `json:"news"`
}
