package controllers

import (
	"context"
	"net/http"

	"github.com/OrazKhairulla/Online-Gaming-Marketplace/backend/database"
	"github.com/OrazKhairulla/Online-Gaming-Marketplace/backend/model"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Place an order
func PlaceOrder(c *gin.Context) {
	userID := c.GetString("userID") // Assume userID is set in middleware
	userObjectID, _ := primitive.ObjectIDFromHex(userID)

	// Get cart items
	cartCollection := database.GetCollection("carts")
	var cart model.Cart
	err := cartCollection.FindOne(context.TODO(), bson.M{"user_id": userObjectID}).Decode(&cart)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Cart not found"})
		return
	}

	// Calculate total
	var total float64
	for _, item := range cart.Items {
		total += float64(item.Quantity) * 59.99 // Assume each game costs $59.99
	}

	// Convert cart items to order items
	var orderItems []model.OrderItem
	for _, item := range cart.Items {
		orderItems = append(orderItems, model.OrderItem{
			GameID:   item.GameID,
			Quantity: item.Quantity,
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
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error placing order"})
		return
	}

	// Clear cart
	_, err = cartCollection.DeleteOne(context.TODO(), bson.M{"user_id": userObjectID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error clearing cart"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Order placed successfully", "order": order})
}

// Get order history
func GetOrders(c *gin.Context) {
	userID := c.GetString("userID") // Assume userID is set in middleware
	userObjectID, _ := primitive.ObjectIDFromHex(userID)

	collection := database.GetCollection("orders")
	cursor, err := collection.Find(context.TODO(), bson.M{"user_id": userObjectID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching orders"})
		return
	}
	defer cursor.Close(context.TODO())

	var orders []model.Order
	if err = cursor.All(context.TODO(), &orders); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error decoding orders"})
		return
	}

	c.JSON(http.StatusOK, orders)
}
