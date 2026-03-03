package models

type BalanceDetail struct {
	FromUserID string  `json:"from_user"`
	ToUser     string  `json:"to_user"`
	Amount     float64 `json:"amount"`
}
