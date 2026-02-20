package config
import (
	"context"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)
  
var DB *mongo.Database
func Connect() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(os.Getenv("MONGO_URI")))
	if err != nil {
		log.Fatal("MongoDB connection error:", err)
	}
	err = client.Ping(ctx, nil)
     if err != nil {
		log.Fatal("MongoDB ping error:", err)
	}
	DB = client.Database(os.Getenv("MONGO_DB"))
	log.Println("Connected to MongoDB successfully")
}
func GetCollection(name string) *mongo.Collection {
	return DB.Collection(name)
}