package repository

import (
	"context"
	"splitwise/config"
	"splitwise/models"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type UserRepo struct{}

func (r *UserRepo) col() *mongo.Collection {
	return config.GetCollection("users")
}

func (r *UserRepo) resetCol() *mongo.Collection {
	return config.GetCollection("password_resets")
}
func (r *UserRepo) CreateUser(user *models.User) error {
	user.ID = primitive.NewObjectID()
	user.CreatedAt = time.Now()
	_, err := r.col().InsertOne(context.Background(), user)
	return err
}
func (r *UserRepo) GetByEmail(email string) (*models.User, error) {
	var user models.User
	err := r.col().FindOne(context.Background(), bson.M{"email": email}).Decode(&user)
	if err != nil {
		return nil, err
	}
	return &user, nil
}
func (r *UserRepo) GetByID(id primitive.ObjectID) (*models.User, error) {
	var user models.User
	err := r.col().FindOne(context.Background(), bson.M{"_id": id}).Decode(&user)
	if err != nil {
		return nil, err
	}
	return &user, nil
}
func (r *UserRepo) UpdateUser(id primitive.ObjectID, name string) error {
	_, err := r.col().UpdateOne(context.Background(), bson.M{"_id": id}, bson.M{"$set": bson.M{"name": name}})
	return err
}

func (r *UserRepo) GetAll() ([]models.User, error) {
	var users []models.User
	cursor, err := r.col().Find(context.Background(), bson.D{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())
	if err := cursor.All(context.Background(), &users); err != nil {
		return nil, err
	}
	return users, nil
}

func (r *UserRepo) UpdatePassword(id primitive.ObjectID, hashedPassword string) error {
	_, err := r.col().UpdateOne(context.Background(), bson.M{"_id": id}, bson.M{"$set": bson.M{"password": hashedPassword}})
	return err
}

func (r *UserRepo) CreatePasswordReset(reset *models.PasswordReset) error {
	reset.ID = primitive.NewObjectID()
	reset.CreatedAt = time.Now()
	// Remove any existing reset tokens for this user
	r.resetCol().DeleteMany(context.Background(), bson.M{"user_id": reset.UserID})
	_, err := r.resetCol().InsertOne(context.Background(), reset)
	return err
}

func (r *UserRepo) GetPasswordResetByToken(token string) (*models.PasswordReset, error) {
	var reset models.PasswordReset
	err := r.resetCol().FindOne(context.Background(), bson.M{"token": token}).Decode(&reset)
	if err != nil {
		return nil, err
	}
	return &reset, nil
}

func (r *UserRepo) DeletePasswordReset(id primitive.ObjectID) error {
	_, err := r.resetCol().DeleteOne(context.Background(), bson.M{"_id": id})
	return err
}
