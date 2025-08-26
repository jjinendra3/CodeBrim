package server

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/jjinendra3/codebrim/services/server"
)

type ServerControllers struct {
	ServerService *server.ServerService
}


func NewServerControllers(serverService *server.ServerService) *ServerControllers {
	return &ServerControllers{ServerService: serverService}
}

func (n *ServerControllers) RegisterServerRoutes(router *gin.Engine){
	
	server := router.Group("/server");

	server.GET("/wake-up/:pwd", n.WakeUp);
	server.GET("/reset/:pwd",n.ResetDB);
}

func (n* ServerControllers) WakeUp(c* gin.Context){
	password:=c.Param("pwd");
	actualPassword:=os.Getenv("RESET_PWD")
	if password!=actualPassword{
		c.JSON(http.StatusUnauthorized,gin.H{
			"success":false,
			"message": "Incorrect Password",
		})
		return
	}
	allUsers,err:=n.ServerService.GetAllUsers();
	if err!=nil{
		c.JSON(http.StatusInternalServerError,gin.H{
			"success":false,
			"message": err.Error(),
		})
		return
	}
	c.JSON(http.StatusAccepted,gin.H{
		"success":true,
		"users": allUsers,
	})
}

func (n* ServerControllers) ResetDB(c* gin.Context){
	password:=c.Param("pwd");
	actualPassword:=os.Getenv("RESET_PWD")
	if password!=actualPassword{
		c.JSON(http.StatusUnauthorized,gin.H{
			"success":false,
			"message": "Incorrect Password",
		})
		return
	}
	err:=n.ServerService.ResetDatabase();
	if err!=nil{
		c.JSON(http.StatusInternalServerError,gin.H{
			"success":false,
			"message": err.Error(),
		})
		return
	}
	c.JSON(http.StatusAccepted,gin.H{
		"success":true,
		"message": "Database reset successfully",
	})
}
