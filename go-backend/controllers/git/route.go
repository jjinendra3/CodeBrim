package git

import (
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/jjinendra3/codebrim/services/git"
)

type Controllers struct {
	Service *git.Service
}

func NewGitControllers(service *git.Service) *Controllers {
	return &Controllers{Service: service}
}

func (n *Controllers) RegisterGitRoutes(router *gin.Engine) {

	git := router.Group("/git")
	fmt.Print(git)
	git.POST("/clone", n.Service.CloneRepo)
	// git.POST("/gitpush/:id", n.Service.GetProjectByID)

}
