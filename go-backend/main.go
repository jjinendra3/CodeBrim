package main

import (
	"fmt"

	"github.com/gin-gonic/gin"
	projectControllers "github.com/jjinendra3/codebrim/controllers/project"
	serverControllers "github.com/jjinendra3/codebrim/controllers/server"
	"github.com/jjinendra3/codebrim/database"
	projectServices "github.com/jjinendra3/codebrim/services/project"
	serverServices "github.com/jjinendra3/codebrim/services/server"
)

func main() {
	router := gin.Default()
	db := database.InitDb()
	if db == nil {
		fmt.Println("Error in db")
		return
	}
	database.AutoMigrate(db)

	serverService := serverServices.NewServerService(db)
	serverController := serverControllers.NewServerControllers(serverService)
	projectService := projectServices.NewProjectService(db)
	projectController := projectControllers.NewProjectControllers(projectService)

	serverController.RegisterServerRoutes(router)
	projectController.RegisterProjectRoutes(router)

	router.Run(":5000")
}
