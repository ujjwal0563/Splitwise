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

type ForgotPasswordRequest struct {
	Email string `json:"email"`
}

type ResetPasswordRequest struct {
	Token       string `json:"token"`
	NewPassword string `json:"new_password"`
}

type PasswordReset struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID    primitive.ObjectID `bson:"user_id"       json:"user_id"`
	OTP       string             `bson:"otp"           json:"otp"`
	ExpiresAt time.Time          `bson:"expires_at"    json:"expires_at"`
	CreatedAt time.Time          `bson:"created_at"    json:"created_at"`
}
