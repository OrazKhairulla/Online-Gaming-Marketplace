package routes

import (
	"github.com/OrazKhairulla/Online-Gaming-Marketplace/backend/controllers"
	"github.com/OrazKhairulla/Online-Gaming-Marketplace/backend/middleware"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	r.POST("/api/auth/register", controllers.Register)
	r.POST("/api/auth/login", controllers.Login)
	r.GET("/api/games/getall", controllers.GetAllGames)
	r.GET("/api/games/search", controllers.SearchGames)
	r.GET("/api/games/:game_id", controllers.GetGameByID)

	protected := r.Group("/api")
	protected.Use(middleware.AuthMiddleware())
	{
		protected.GET("/protected", func(c *gin.Context) {
			c.JSON(200, gin.H{"message": "You are authorized"})
		})

		// User routes
		protected.POST("/user/update", controllers.UpdateUser)
		protected.GET("/user/library", controllers.GetUserLibrary)

		// Cart routes
		protected.POST("/cart", controllers.AddToCart)
		protected.DELETE("/cart/:game_id", controllers.RemoveFromCart)
		protected.GET("/cart", controllers.GetCart)

		// Order routes
		protected.POST("/orders", controllers.PlaceOrder)
		protected.GET("/orders", controllers.GetOrder)
		protected.POST("/orders/complete/:order_id", controllers.CompleteOrder)
	}
}
