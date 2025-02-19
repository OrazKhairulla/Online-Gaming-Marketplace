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
	"go.mongodb.org/mongo-driver/mongo"
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

func GetGameByID(c *gin.Context) {
	// retrieve game ID from URL
	gameID := c.Param("game_id")
	objectID, err := primitive.ObjectIDFromHex(gameID)
	if err != nil {
		log.Println("Invalid game ID format:", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid game ID format"})
		return
	}

	collection := database.GetCollection("games")
	var game model.Game

	// find game by ID
	err = collection.FindOne(context.TODO(), bson.M{"_id": objectID}).Decode(&game)
	if err != nil {
		log.Println("Game not found or error fetching game:", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Game not found"})
		return
	}

	// return game details
	c.JSON(http.StatusOK, game)
}

func DownloadGame(c *gin.Context) {
	// Get userID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authorized"})
		return
	}

	// Convert userID to string and ObjectID
	userIDStr, ok := userID.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID format"})
		return
	}
	userObjectID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID"})
		return
	}

	// Get game ID from URL
	gameID := c.Param("game_id")
	gameObjectID, err := primitive.ObjectIDFromHex(gameID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Game ID format"})
		return
	}

	// Check if the user owns the game
	userCollection := database.GetCollection("users")
	var user model.User

	err = userCollection.FindOne(context.TODO(), bson.M{"_id": userObjectID}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		} else {
			log.Println("Error fetching user:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching user"})
		}
		return
	}

	// Check if the game is in user's owned games
	ownsGame := false
	for _, ownedGame := range user.OwnedGames {
		if ownedGame.GameID == gameObjectID {
			ownsGame = true
			break
		}
	}

	if !ownsGame {
		c.JSON(http.StatusForbidden, gin.H{"error": "User does not own this game"})
		return
	}

	// Fetch game details
	gameCollection := database.GetCollection("games")
	var game model.Game
	err = gameCollection.FindOne(context.TODO(), bson.M{"_id": gameObjectID}).Decode(&game)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "Game not found"})
		} else {
			log.Println("Error fetching game details:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching game details"})
		}
		return
	}

	// Return the download URL
	c.JSON(http.StatusOK, gin.H{"download_url": game.DownloadURL})
}
