package models
import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)
type User struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name      string             `bson:"name"          json:"name"`
	Email     string             `bson:"email"         json:"email"`
	Password  string             `bson:"password"      json:"-"`
	CreatedAt time.Time          `bson:"created_at"    json:"created_at"`
}

type RegisterRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}
	type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}
	type UpdateProfileRequest struct {
	Name string `json:"name"`
}

