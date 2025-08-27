package server

import (
	"github.com/gin-gonic/gin"
	"github.com/jjinendra3/codebrim/services/server"
)

type Controllers struct {
	Service *server.Service
}

func NewServerControllers(service *server.Service) *Controllers {
	return &Controllers{Service: service}
}

func (n *Controllers) RegisterServerRoutes(router *gin.Engine) {

	server := router.Group("/server")

	server.GET("/wake-up/:pwd", n.Service.GetAllUsers)
	server.GET("/reset/:pwd", n.Service.ResetDatabase)
}
