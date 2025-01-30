package main

import (
	"fmt"
	"log"

	"github.com/OrazKhairulla/Online-Gaming-Marketplace/backend/database"
	"github.com/OrazKhairulla/Online-Gaming-Marketplace/backend/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	database.ConnectDB()

	r := gin.Default()

	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "Server is running!"})
	})

	routes.SetupRoutes(r)
	port := ":8080"
	fmt.Println("Server is running on", port)
	if err := r.Run(port); err != nil {
		log.Fatal(err)
	}
}
