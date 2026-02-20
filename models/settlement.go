package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Settlement struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	GroupID   primitive.ObjectID `bson:"group_id"      json:"group_id"`
	PaidBy    primitive.ObjectID `bson:"paid_by"       json:"paid_by"`
	PaidTo    primitive.ObjectID `bson:"paid_to"       json:"paid_to"`
	Amount    float64            `bson:"amount"        json:"amount"`
	CreatedAt time.Time          `bson:"created_at"    json:"created_at"`
}

type SettleRequest struct {
	PaidBy string  `json:"paid_by"`
	PaidTo string  `json:"paid_to"`
	Amount float64 `json:"amount"`
}
