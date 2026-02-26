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

type ExpenseRepo struct{}

func (r *ExpenseRepo) col() *mongo.Collection {
	return config.GetCollection("expenses")
}
func (r *ExpenseRepo) CreateExpense(expense *models.Expense) error {
	expense.ID = primitive.NewObjectID()
	expense.CreatedAt = time.Now()
	_, err := r.col().InsertOne(context.Background(), expense)
	return err
}
func (r *ExpenseRepo) GetByGroup(groupID primitive.ObjectID) ([]models.Expense, error) {
	cursor, err := r.col().Find(context.Background(), bson.M{"group_id": groupID})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())
	var expenses []models.Expense
	if err := cursor.All(context.Background(), &expenses); err != nil {
		return nil, err
	}
	return expenses, nil
}
func (r *ExpenseRepo) DeleteExpense(id primitive.ObjectID) error {
	_, err := r.col().DeleteOne(context.Background(), bson.M{"_id": id})
	return err
}
func (r *ExpenseRepo) DeleteByGroupID(groupID primitive.ObjectID) error {
	_, err := r.col().DeleteMany(context.Background(), bson.M{"group_id": groupID})
	return err
}
func (r *ExpenseRepo) GetByID(id primitive.ObjectID) (*models.Expense, error) {
	var expense models.Expense
	err := r.col().FindOne(context.Background(), bson.M{"_id": id}).Decode(&expense)
	if err != nil {
		return nil, err
	}
	return &expense, nil
}
