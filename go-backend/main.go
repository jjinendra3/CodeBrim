package main

import (
	"fmt"

	"github.com/gin-gonic/gin"
	controllers "github.com/jjinendra3/codebrim/controllers/server"
	"github.com/jjinendra3/codebrim/database"
	services "github.com/jjinendra3/codebrim/services/server"
)

func main() {
  router := gin.Default()
  db:= database.InitDb();
  if db==nil{
		fmt.Println("Error in db");
		return
	}
  database.AutoMigrate(db);

  serverService := services.NewServerService(db)

	serverController := controllers.NewServerControllers(serverService)
	serverController.RegisterServerRoutes(router)
  
  router.Run(":5000")
}