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

type FriendRepo struct{}

func (r *FriendRepo) col() *mongo.Collection {
	return config.GetCollection("friends")
}

func (r *FriendRepo) Create(friend *models.Friend) error {
	friend.ID = primitive.NewObjectID()
	friend.CreatedAt = time.Now()
	friend.UpdatedAt = time.Now()
	_, err := r.col().InsertOne(context.Background(), friend)
	return err
}

func (r *FriendRepo) GetByID(id primitive.ObjectID) (*models.Friend, error) {
	var friend models.Friend
	err := r.col().FindOne(context.Background(), bson.M{"_id": id}).Decode(&friend)
	if err != nil {
		return nil, err
	}
	return &friend, nil
}

// FindBetween finds a friendship record between two users (in either direction).
func (r *FriendRepo) FindBetween(userA, userB primitive.ObjectID) (*models.Friend, error) {
	var friend models.Friend
	filter := bson.M{
		"$or": []bson.M{
			{"requester": userA, "addressee": userB},
			{"requester": userB, "addressee": userA},
		},
	}
	err := r.col().FindOne(context.Background(), filter).Decode(&friend)
	if err != nil {
		return nil, err
	}
	return &friend, nil
}

// UpdateStatus updates the status and updated_at timestamp of a friendship.
func (r *FriendRepo) UpdateStatus(id primitive.ObjectID, status string) error {
	_, err := r.col().UpdateOne(
		context.Background(),
		bson.M{"_id": id},
		bson.M{"$set": bson.M{"status": status, "updated_at": time.Now()}},
	)
	return err
}

// Delete removes a friendship record.
func (r *FriendRepo) Delete(id primitive.ObjectID) error {
	_, err := r.col().DeleteOne(context.Background(), bson.M{"_id": id})
	return err
}

// GetFriends returns all accepted friendships for a user.
func (r *FriendRepo) GetFriends(userID primitive.ObjectID) ([]models.Friend, error) {
	filter := bson.M{
		"status": "accepted",
		"$or": []bson.M{
			{"requester": userID},
			{"addressee": userID},
		},
	}
	cursor, err := r.col().Find(context.Background(), filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var friends []models.Friend
	if err := cursor.All(context.Background(), &friends); err != nil {
		return nil, err
	}
	return friends, nil
}

// GetPendingRequests returns all pending friend requests where the user is the addressee.
func (r *FriendRepo) GetPendingRequests(userID primitive.ObjectID) ([]models.Friend, error) {
	filter := bson.M{
		"addressee": userID,
		"status":    "pending",
	}
	cursor, err := r.col().Find(context.Background(), filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var friends []models.Friend
	if err := cursor.All(context.Background(), &friends); err != nil {
		return nil, err
	}
	return friends, nil
}

// GetSentRequests returns all pending friend requests sent by the user.
func (r *FriendRepo) GetSentRequests(userID primitive.ObjectID) ([]models.Friend, error) {
	filter := bson.M{
		"requester": userID,
		"status":    "pending",
	}
	cursor, err := r.col().Find(context.Background(), filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var friends []models.Friend
	if err := cursor.All(context.Background(), &friends); err != nil {
		return nil, err
	}
	return friends, nil
}
