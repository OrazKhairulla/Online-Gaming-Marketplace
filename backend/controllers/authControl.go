package controllers

import (
	"context"
	"net/http"

	"github.com/OrazKhairulla/Online-Gaming-Marketplace/backend/database"
	"github.com/OrazKhairulla/Online-Gaming-Marketplace/backend/model"
	jwtServices "github.com/OrazKhairulla/Online-Gaming-Marketplace/backend/services"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
)

// Register a new user
func Register(c *gin.Context) {
	var requestBody model.User

	// Bind request body to struct
	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	// Check if user already exists
	collection := database.GetCollection("users")
	var existingUser model.User
	err := collection.FindOne(context.TODO(), bson.M{"email": requestBody.Email}).Decode(&existingUser)
	if err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Email already in use"})
		return
	}

	// Hash password before storing
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(requestBody.Password), bcrypt.DefaultCost)
	requestBody.Password = string(hashedPassword)

	// Create user object
	newUser := model.User{
		ID:       primitive.NewObjectID(),
		Email:    requestBody.Email,
		Password: requestBody.Password,
	}

	// Insert user into MongoDB
	_, err = collection.InsertOne(context.TODO(), newUser)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creating user"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "User registered successfully"})
}

// Login user and generate JWT token
func Login(c *gin.Context) {
	var requestBody model.User
	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	collection := database.GetCollection("users")

	// Find user by email
	var user model.User
	err := collection.FindOne(context.TODO(), bson.M{"email": requestBody.Email}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Compare password hashes
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(requestBody.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Generate JWT token
	token, _ := jwtServices.GenerateToken(user.Email)

	c.JSON(http.StatusOK, gin.H{"token": token})
}
