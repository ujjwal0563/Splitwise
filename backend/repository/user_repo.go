package repository
import (
	"context"
	"time"
    "splitwise/config"
	"splitwise/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type UserRepo struct {}
  func (r *UserRepo) col() *mongo.Collection {
	return config.GetCollection("users")
}
func (r *UserRepo) CreateUser(user *models.User) error{
	user.ID= primitive.NewObjectID()
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