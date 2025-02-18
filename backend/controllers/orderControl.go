package controllers

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/OrazKhairulla/Online-Gaming-Marketplace/backend/database"
	"github.com/OrazKhairulla/Online-Gaming-Marketplace/backend/model"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

// PlaceOrder создаёт новый заказ на основе корзины пользователя
func PlaceOrder(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

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

	cartCollection := database.GetCollection("cart")
	var cart model.Cart
	err = cartCollection.FindOne(context.TODO(), bson.M{"user_id": userObjectID}).Decode(&cart)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			log.Println("Cart not found for user:", userIDStr)
			c.JSON(http.StatusNotFound, gin.H{"error": "Cart not found"})
		} else {
			log.Println("Error fetching cart:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching cart"})
		}
		return
	}

	if len(cart.Items) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cart is empty"})
		return
	}

	gameCollection := database.GetCollection("games")
	totalPrice := 0.0
	orderItems := make([]model.OrderItem, len(cart.Items))

	for i, cartItem := range cart.Items {
		var game model.Game
		err := gameCollection.FindOne(context.TODO(), bson.M{"_id": cartItem.GameID}).Decode(&game)
		if err != nil {
			log.Println("Error fetching game details for game_id:", cartItem.GameID, err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching game details"})
			return
		}

		totalPrice += game.Price
		orderItems[i] = model.OrderItem(cartItem) // Теперь используем корректное преобразование
	}

	order := model.Order{
		ID:        primitive.NewObjectID(),
		UserID:    userObjectID,
		Items:     orderItems,
		Total:     totalPrice,
		CreatedAt: time.Now(),
		Status:    "pending",
	}

	orderCollection := database.GetCollection("orders")
	_, err = orderCollection.InsertOne(context.TODO(), order)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to place order"})
		return
	}

	_, err = cartCollection.UpdateOne(
		context.TODO(),
		bson.M{"user_id": userObjectID},
		bson.M{"$set": bson.M{"items": []model.CartItem{}, "updated_at": time.Now()}},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear cart"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Order placed successfully", "orderID": order.ID.Hex(), "total": totalPrice})
}

func GetOrder(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		log.Println("Unauthorized access: missing userID")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	userIDStr, ok := userID.(string)
	if !ok {
		log.Println("Invalid user ID format:", userID)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID format"})
		return
	}

	userObjectID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		log.Println("Invalid user ID:", userIDStr, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID"})
		return
	}

	orderCollection := database.GetCollection("orders")
	gameCollection := database.GetCollection("games")

	// Поиск заказов пользователя
	cursor, err := orderCollection.Find(context.TODO(), bson.M{"user_id": userObjectID})
	if err != nil {
		log.Println("Error finding orders:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching orders"})
		return
	}
	defer cursor.Close(context.TODO())

	// Перебираем заказы
	var responseOrders []gin.H
	for cursor.Next(context.TODO()) {
		var order model.Order
		if err := cursor.Decode(&order); err != nil {
			log.Println("Error decoding order:", err)
			continue
		}

		// Получаем детальную информацию об играх
		var detailedItems []gin.H
		for _, item := range order.Items {
			var game model.Game
			err := gameCollection.FindOne(context.TODO(), bson.M{"_id": item.GameID}).Decode(&game)
			if err != nil {
				if err == mongo.ErrNoDocuments {
					log.Println("Game not found for game_id:", item.GameID)
					continue
				}
				log.Println("Error fetching game details for game_id:", item.GameID, err)
				continue
			}

			detailedItems = append(detailedItems, gin.H{
				"id":    game.ID, // Преобразуем ObjectID в строку
				"title": game.Title,
				"price": game.Price,
			})
		}

		// Формируем структуру заказа для ответа
		responseOrders = append(responseOrders, gin.H{
			"id":     order.ID.Hex(),
			"total":  order.Total,
			"status": order.Status,
			"games":  detailedItems,
		})
	}

	// Если заказов нет, возвращаем пустой массив
	if len(responseOrders) == 0 {
		log.Println("No orders found for user:", userIDStr)
		c.JSON(http.StatusOK, gin.H{"orders": []gin.H{}})
		return
	}

	// Отправляем клиенту список заказов и игр
	log.Println("Sending response orders:", responseOrders)
	c.JSON(http.StatusOK, gin.H{"orders": responseOrders})
}
