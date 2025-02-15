package controllers

import (
	"net/http"

	"github.com/OrazKhairulla/Online-Gaming-Marketplace/backend/database"
	"github.com/OrazKhairulla/Online-Gaming-Marketplace/backend/model"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
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
