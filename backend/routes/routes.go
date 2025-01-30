package routes

import (
	"github.com/OrazKhairulla/Online-Gaming-Marketplace/backend/controllers"
	"github.com/OrazKhairulla/Online-Gaming-Marketplace/backend/middleware"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	r.POST("/api/auth/register", controllers.Register)
	r.POST("/api/auth/login", controllers.Login)

	protected := r.Group("/api")
	protected.Use(middleware.AuthMiddleware())
	{
		protected.GET("/protected", func(c *gin.Context) {
			c.JSON(200, gin.H{"message": "You are authorized"})
		})
	}
}
