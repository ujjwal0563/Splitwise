package models
import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)
type ExpenseSplit struct {
	UserID primitive.ObjectID `bson:"user_id" json:"user_id"`
	Amount float64            `bson:"amount"  json:"amount"`
}	
type Expense struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	GroupID     primitive.ObjectID `bson:"group_id"      json:"group_id"`
	PaidBy      primitive.ObjectID `bson:"paid_by"       json:"paid_by"`
	Amount      float64            `bson:"amount"        json:"amount"`
    Description string             `bson:"description"   json:"description"`	
	Splits      []ExpenseSplit      `bson:"splits"        json:"splits"`
	CreatedAt   time.Time          `bson:"created_at"    json:"created_at"`
}
type AddExpenseRequest struct {
	PaidBy	  string  `json:"paid_by"`
	Amount    float64 `json:"amount"`
	Description string  `json:"description"`
	SplitsType string `json:"splits_type"`
	Splits     []struct{
	   UserID string  `json:"user_id"`
	   Amount float64 `json:"amount"`
	} `json:"splits"`
}