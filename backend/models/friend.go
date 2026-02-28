package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Friend represents a friendship between two users.
// Status: "pending", "accepted", "rejected"
type Friend struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Requester primitive.ObjectID `bson:"requester"     json:"requester"`
	Addressee primitive.ObjectID `bson:"addressee"     json:"addressee"`
	Status    string             `bson:"status"        json:"status"`
	CreatedAt time.Time          `bson:"created_at"    json:"created_at"`
	UpdatedAt time.Time          `bson:"updated_at"    json:"updated_at"`
}

type FriendRequest struct {
	FriendID string `json:"friend_id"`
}

type FriendResponse struct {
	ID        primitive.ObjectID `json:"id"`
	User      *User              `json:"user"`
	Status    string             `json:"status"`
	CreatedAt time.Time          `json:"created_at"`
}
