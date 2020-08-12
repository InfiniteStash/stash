package models

type StashBoxInstance struct {
	ID        int             `db:"id" json:"id"`
	Endpoint  string          `db:"endpoint" json:"endpoint"`
	APIKey    string          `db:"api_key" json:"api_key"`
}
