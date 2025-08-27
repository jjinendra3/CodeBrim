package project

import (
	"github.com/gin-gonic/gin"
	"github.com/jjinendra3/codebrim/services/project"
)

type Controllers struct {
	Service *project.Service
}

func NewProjectControllers(service *project.Service) *Controllers {
	return &Controllers{Service: service}
}

func (n *Controllers) RegisterProjectRoutes(router *gin.Engine) {

	project := router.Group("/project")

	project.GET("/newcompiler/:lang", n.Service.NewCompiler)
	// project.GET("/getproject/:id", n.Service.GetProjectByID)
	// project.GET("/getfile/:id", n.Service.GetFileByID)
	// project.GET("/download/:id", n.Service.DownloadProject)
	// project.GET("/clone-snippet/:id", n.Service.CloneSnippet)

	// project.PUT("/update-item", n.Service.ResetDatabase)

	// project.POST("/add-item", n.Service.AddProject)
	// project.POST("/project-privacy/:id", n.Service.SetProjectPrivacy)
	// project.POST("/add-feedback", n.Service.AddFeedback)

	// project.DELETE("/delete-item/:id", n.Service.DeleteItem)
}
