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
type SettlementRepo struct {}		
func (r *SettlementRepo) col() *mongo.Collection {
	return config.GetCollection("settlements")
}
func (r *SettlementRepo) CreateSettlement(settlement *models.Settlement) error {
	settlement.ID = primitive.NewObjectID()
	settlement.CreatedAt = time.Now()
	_, err := r.col().InsertOne(context.Background(), settlement)
	return err
}
func (r *SettlementRepo) GetByGroup(groupID primitive.ObjectID) ([]models.Settlement, error) {
	cursor, err := r.col().Find(context.Background(), bson.M{"group_id": groupID})
	if err != nil {
		return nil, err
	}	
	defer cursor.Close(context.Background())
	var settlements []models.Settlement
	if err := cursor.All(context.Background(), &settlements); err != nil {
		return nil, err
	}
	return settlements, nil
}
func (r *SettlementRepo) GetByUser(id primitive.ObjectID) ([]models.Settlement, error) {
    cursor, err := r.col().Find(context.Background(),
        bson.M{"$or": []bson.M{
            {"paid_by": id},
            {"paid_to": id},
        }},
    )
    if err != nil {        
        return nil, err
    }
    defer cursor.Close(context.Background())
    var settlements []models.Settlement
    if err := cursor.All(context.Background(), &settlements); err != nil {
        return nil, err
    }
    return settlements, nil
}
func (r *SettlementRepo) DeleteSettlement(id primitive.ObjectID) error {
	_, err := r.col().DeleteOne(context.Background(), bson.M{"_id": id})
	return err
}