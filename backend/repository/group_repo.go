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

type GroupRepo struct{}

func (r *GroupRepo) col() *mongo.Collection {
	return config.GetCollection("groups")
}
func (r *GroupRepo) CreateGroup(group *models.Group) error {
	group.ID = primitive.NewObjectID()
	group.CreatedAt = time.Now()
	_, err := r.col().InsertOne(context.Background(), group)
	return err
}
func (r *GroupRepo) GetByID(id primitive.ObjectID) (*models.Group, error) {
	var group models.Group
	err := r.col().FindOne(context.Background(), bson.M{"_id": id}).Decode(&group)
	if err != nil {
		return nil, err
	}
	return &group, nil
}
func (r *GroupRepo) AddMember(groupID, userID primitive.ObjectID) error {
	_, err := r.col().UpdateOne(context.Background(), bson.M{"_id": groupID}, bson.M{"$addToSet": bson.M{"members": userID}})
	return err
}
func (r *GroupRepo) RemoveMember(groupID, userID primitive.ObjectID) error {
	_, err := r.col().UpdateOne(context.Background(), bson.M{"_id": groupID}, bson.M{"$pull": bson.M{"members": userID}})
	return err
}
func (r *GroupRepo) UpdateGroupName(id primitive.ObjectID, name string) error {
	_, err := r.col().UpdateOne(context.Background(), bson.M{"_id": id}, bson.M{"$set": bson.M{"name": name}})
	return err
}
func (r *GroupRepo) DeleteGroup(id primitive.ObjectID) error {
	_, err := r.col().DeleteOne(context.Background(), bson.M{"_id": id})
	return err
}
func (r *GroupRepo) GetGroupsByUserID(userID primitive.ObjectID) ([]models.Group, error) {
	cursor, err := r.col().Find(context.Background(), bson.M{"members": userID})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())
	var groups []models.Group
	if err := cursor.All(context.Background(), &groups); err != nil {
		return nil, err
	}
	return groups, nil
}
