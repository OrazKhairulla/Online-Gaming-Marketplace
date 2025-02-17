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

// getGamePrice fetches the price of a game by its ID
func getGamePrice(gameID primitive.ObjectID) float64 {
	var game model.Game
	gameCollection := database.GetCollection("games")
	err := gameCollection.FindOne(context.TODO(), bson.M{"_id": gameID}).Decode(&game)
	if err != nil {
		log.Println("Error fetching game price:", err)
		return 0.0
	}
	return game.Price
}

// Place an order
func PlaceOrder(c *gin.Context) {
	userID := c.GetString("userID") // Assume userID is set in middleware
	userObjectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		log.Println("Error converting userID to ObjectID:", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	// Get cart items
	cartCollection := database.GetCollection("cart")
	var cart model.Cart
	err = cartCollection.FindOne(context.TODO(), bson.M{"user_id": userObjectID}).Decode(&cart)
	if err != nil {
		log.Println("Error getting cart:", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Cart not found"})
		return
	}

	// Calculate total
	var total float64
	// тотал калкулатить ететин функция керек

	// Convert cart items to order items
	var orderItems []model.OrderItem
	for _, cartItem := range cart.Items {
		orderItems = append(orderItems, model.OrderItem{
			GameID: cartItem.GameID,
		})
	}

	// Create order
	order := model.Order{
		ID:     primitive.NewObjectID(),
		UserID: userObjectID,
		Items:  orderItems,
		Total:  total,
	}

	orderCollection := database.GetCollection("orders")
	_, err = orderCollection.InsertOne(context.TODO(), order)
	if err != nil {
		log.Println("Error placing order:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error placing order"})
		return
	}

	// Clear cart
	_, err = cartCollection.DeleteOne(context.TODO(), bson.M{"user_id": userObjectID})
	if err != nil {
		log.Println("Error clearing cart:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error clearing cart"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Order placed successfully", "order": order})
}

func GetOrders(c *gin.Context) {
	userID := c.GetString("userID")
	userObjectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		log.Println("Error converting userID to ObjectID:", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	log.Println("Fetching orders for user ID:", userObjectID)

	collection := database.GetCollection("orders")
	cursor, err := collection.Find(context.TODO(), bson.M{"user_id": userObjectID})
	if err != nil {
		log.Println("Error fetching orders:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching orders"})
		return
	}
	defer cursor.Close(context.TODO())

	var orders []model.Order
	if err = cursor.All(context.TODO(), &orders); err != nil {
		log.Println("Error decoding orders:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error decoding orders"})
		return
	}

	log.Println("Successfully fetched orders:", orders)

	c.JSON(http.StatusOK, orders)
}

func CreateOrder(c *gin.Context) {
	userID := c.GetString("userID")
	userObjectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var cart model.Cart
	cartCollection := database.GetCollection("cart")
	err = cartCollection.FindOne(context.TODO(), bson.M{"user_id": userObjectID}).Decode(&cart)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Cart not found"})
		return
	}

	var total float64
	var orderItems []model.OrderItem
	for _, cartItem := range cart.Items {
		orderItems = append(orderItems, model.OrderItem{
			GameID: cartItem.GameID,
		})
		// Calculate total (assuming you have a function to get game price)
		total += getGamePrice(cartItem.GameID)
	}

	order := model.Order{
		ID:     primitive.NewObjectID(),
		UserID: userObjectID,
		Items:  orderItems,
		Total:  total,
	}

	orderCollection := database.GetCollection("orders")
	_, err = orderCollection.InsertOne(context.TODO(), order)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error placing order"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Order created successfully", "order": order})
}

func ProcessPayment(c *gin.Context) {
	var input struct {
		Email string `json:"email" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Send a fake check email (you can use an email service like SendGrid or SMTP)
	sendFakeCheckEmail(input.Email)

	c.JSON(http.StatusOK, gin.H{"message": "Payment processed successfully"})
}

func sendFakeCheckEmail(email string) {
	// Implement email sending logic here
	log.Printf("Sending fake check email to %s\n", email)
}
