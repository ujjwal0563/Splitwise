package models
import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)
type NetBalance struct {
	UserID primitive.ObjectID  `json:"user_id"`
	UserName string            `json:"user_name"`
	Amount float64             `json:"amount"`
}
type BalanceDetail struct {
	FromUserID string `json:"from_user"`
	TOUser string `json:"to_user"`
	Amount float64 `json:"amount"`
}
