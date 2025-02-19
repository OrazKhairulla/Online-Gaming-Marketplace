package database

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var client *mongo.Client

func ConnectDB() {
	// Загружаем переменные окружения из .env
	if err := godotenv.Load(); err != nil {
		log.Fatal("❌ Ошибка загрузки .env файла")
	}

	// Получаем URI из переменной окружения
	uri := os.Getenv("MONGO_URI")
	if uri == "" {
		log.Fatal("❌ MONGO_URI не найден в .env файле")
	}

	clientOptions := options.Client().ApplyURI(uri)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var err error
	client, err = mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatal("❌ Не удалось подключиться к MongoDB:", err)
	}

	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatal("❌ Не удалось выполнить ping MongoDB:", err)
	}

	fmt.Println("✅ Успешное подключение к MongoDB")
}

// GetCollection возвращает коллекцию MongoDB
func GetCollection(collectionName string) *mongo.Collection {
	if client == nil {
		log.Fatal("❌ База данных не подключена")
	}
	return client.Database("game_log").Collection(collectionName)
}

// CloseDB закрывает соединение с MongoDB
func CloseDB() {
	if client != nil {
		err := client.Disconnect(context.TODO())
		if err != nil {
			log.Fatal("❌ Не удалось отключиться от MongoDB:", err)
		} else {
			fmt.Println("✅ Соединение с MongoDB закрыто")
		}
	}
}
