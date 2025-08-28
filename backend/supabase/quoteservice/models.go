package SupabaseQuotes

import "time"

type DailyQuote struct {
	tableName struct{} `pg:"quotes"`

	ID        string    `pg:"id,pk" json:"id"`
	Author    string    `pg:"author" json:"author"`
	Quote     string    `pg:"quote" json:"quote"`
	CreatedAt time.Time `pg:"createdAt" json:"createdAt"`
}

// const (
// 	quotesTable = "quotes"
// )
