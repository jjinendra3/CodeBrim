package main

import (
	"fmt"

	"github.com/gin-gonic/gin"
	gitControllers "github.com/jjinendra3/codebrim/controllers/git"
	projectControllers "github.com/jjinendra3/codebrim/controllers/project"
	serverControllers "github.com/jjinendra3/codebrim/controllers/server"
	"github.com/jjinendra3/codebrim/database"
	gitServices "github.com/jjinendra3/codebrim/services/git"
	projectServices "github.com/jjinendra3/codebrim/services/project"
	serverServices "github.com/jjinendra3/codebrim/services/server"
)

func main() {
	router := gin.Default()
	db, err := database.InitDb()
	if err != nil {
		fmt.Println(err.Error())
		return
	}
	database.AutoMigrate(db)

	serverService := serverServices.NewServerService(db)
	serverController := serverControllers.NewServerControllers(serverService)
	projectService := projectServices.NewProjectService(db)
	projectController := projectControllers.NewProjectControllers(projectService)
	gitService := gitServices.NewGitService(db)
	gitController := gitControllers.NewGitControllers(gitService)

	serverController.RegisterServerRoutes(router)
	projectController.RegisterProjectRoutes(router)
	gitController.RegisterGitRoutes(router)

	router.Run(":5000")
}
