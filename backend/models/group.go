package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Group struct {
	ID        primitive.ObjectID   `bson:"_id,omitempty" json:"id"`
	Name      string               `bson:"name"          json:"name"`
	CreatedBy primitive.ObjectID   `bson:"created_by"   json:"created_by"`
	Members   []primitive.ObjectID `bson:"members"      json:"members"`
	CreatedAt time.Time            `bson:"created_at"    json:"created_at"`
}
type CreateGroupRequest struct {
	Name string `json:"name"`
}
type AddMemberRequest struct {
	UserID string `json:"user_id"`
}
type UpdateGroupRequest struct {
	Name string `json:"name"`
}
