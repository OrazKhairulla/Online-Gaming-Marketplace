package routes

import (
	"github.com/OrazKhairulla/Online-Gaming-Marketplace/controllers"
	"github.com/OrazKhairulla/Online-Gaming-Marketplace/middleware"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	// Authentication routes
	r.POST("/api/auth/register", controllers.Register)
	r.POST("/api/auth/login", controllers.Login)

	// Protected routes
	protected := r.Group("/api")
	protected.Use(middleware.AuthMiddleware())
	{
		protected.GET("/orders", controllers.GetOrders)
		protected.POST("/orders", controllers.CreateOrder)
	}
}
