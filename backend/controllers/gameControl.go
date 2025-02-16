package controllers

import (
	"context"
	"log"
	"net/http"

	"github.com/OrazKhairulla/Online-Gaming-Marketplace/backend/database"
	"github.com/OrazKhairulla/Online-Gaming-Marketplace/backend/model"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func GetAllGames(c *gin.Context) {
	collection := database.GetCollection("games")
	cursor, err := collection.Find(c, bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch games"})
		return
	}
	defer cursor.Close(c)

	var games []model.Game
	if err = cursor.All(c, &games); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse games"})
		return
	}

	c.JSON(http.StatusOK, games)
}

func SearchGames(c *gin.Context) {
	searchTerm := c.Query("title")
	collection := database.GetCollection("games")
	var games []model.Game

	filter := bson.M{"title": bson.M{"$regex": searchTerm, "$options": "i"}}
	cursor, err := collection.Find(c, filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching games"})
		return
	}
	defer cursor.Close(c)

	if err = cursor.All(c, &games); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error decoding games"})
		return
	}

	c.JSON(http.StatusOK, games)
}

// Get game by ID
func GetGameByID(c *gin.Context) {
	// Извлечение game_id из параметров URL
	gameID := c.Param("game_id")
	objectID, err := primitive.ObjectIDFromHex(gameID)
	if err != nil {
		log.Println("Invalid game ID format:", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid game ID format"})
		return
	}

	collection := database.GetCollection("games")
	var game model.Game

	// Поиск игры по ID
	err = collection.FindOne(context.TODO(), bson.M{"_id": objectID}).Decode(&game)
	if err != nil {
		log.Println("Game not found or error fetching game:", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Game not found"})
		return
	}

	// Возвращаем найденную игру
	c.JSON(http.StatusOK, game)
}
