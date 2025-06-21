package decision

import (
	"context"
	"errors"
	"net"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	custom "github.tools.aya/aya/decisionCLI/pkg/errors"
	"github.tools.aya/aya/decisionCLI/pkg/firestore"
)

// IPRanges is the interface for getting data.

//go:generate mockgen --source=presenter.go --destination mocks/presenter.go --package mocks
type PolicyList interface {
	Get(ctx context.Context, policyListID string) (firestore.PolicyList, error)
	GetUserPolicyRepo(username string) (*firestore.PolicyRepository, error)
}

type Presenter struct {
	policy   PolicyList
	userRepo firestore.UserRepository // Add this field for userRepo
	//mongoDB  *mongo.Database
}

func NewPresenter(ranges PolicyList, userRepo firestore.UserRepository) *Presenter {
	return &Presenter{
		policy:   ranges,
		userRepo: userRepo, // Initialize userRepo
		//mongoDB:  mongoDB,
	}
}

func (pr Presenter) CheckIP(c *gin.Context) {
	// Extract policyListID from the URL
	policyListID := c.Param("id")
	if policyListID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Policy ID is required"})
		return
	}

	// Parse and validate the JSON request body
	var ipAddress struct {
		Username string `json:"username" binding:"required"`
		Address  string `json:"ip" binding:"required"`
	}
	if err := c.ShouldBindJSON(&ipAddress); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid body", "error": err.Error()})
		return
	}

	// Validate the IP address format
	parsedIP := net.ParseIP(ipAddress.Address)
	if parsedIP == nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid IP address format"})
		return
	}
	// Check if the user exists in the Firestore UserCollection
	userExists, err := pr.userRepo.UserExists(c.Request.Context(), ipAddress.Username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to check user existence", "error": err.Error()})
		return
	}
	if !userExists {
		c.JSON(http.StatusNotFound, gin.H{"message": "User does not exist"})
		return
	}

	// Fetch the policy from Firestore
	policy, err := pr.policy.Get(c.Request.Context(), policyListID)
	if err != nil {
		if handleNotFound(c, err) {
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to fetch policy", "error": err.Error()})
		return
	}

	// Check if the policy belongs to the username
	if policy.Username != ipAddress.Username {
		c.JSON(http.StatusForbidden, gin.H{"message": "The username does not have a policy with this ID"})
		return
	}

	// Check if the IP matches the policy ranges
	isContained := false
	for _, cidr := range policy.Ranges {
		_, ipNet, err := net.ParseCIDR(cidr)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Invalid CIDR range in policy", "error": err.Error()})
			return
		}
		if ipNet.Contains(parsedIP) {
			isContained = true
			break
		}
	}

	if !isContained {
		c.JSON(http.StatusForbidden, gin.H{"message": "IP address is not part of the policy list"})
		return
	}
	// Handle policy types
	switch policy.Type {
	case "allow":
		c.JSON(http.StatusOK, gin.H{"message": "IP address is allowed"})
	case "block":
		c.JSON(http.StatusOK, gin.H{"message": "IP address is blocked"})
	case "restricted":
		c.JSON(http.StatusOK, gin.H{"message": "IP address is restricted"})
	default:
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Unknown policy type"})
	}
}
func (pr Presenter) CheckIPBrowser(c *gin.Context) {
	username := c.Query("username")
	if username == "" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Username is required"})
		return
	}
	// Extract policyListID from the URL
	policyListID := c.Param("id")
	if policyListID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Policy ID is required"})
		return
	}

	// Parse and validate the JSON request body
	var ipAddress IP
	if err := c.ShouldBindJSON(&ipAddress); err != nil {
		c.JSON(http.StatusBadRequest, Response{Message: "Invalid body."})
		return
	}

	// Dynamically set the user's collection
	repo, err := pr.policy.GetUserPolicyRepo(username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to access user-specific collection"})
		return
	}

	// Fetch the policy from the user's collection
	policy, err := repo.Get(c, policyListID)
	if err != nil {
		if handleNotFound(c, err) {
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to fetch policy", "error": err.Error()})
		return
	}

	// Check if the IP matches the policy ranges
	isAllowed := false
	for _, cidr := range policy.Ranges {
		if firestore.IsIPInCIDR(ipAddress.Address, cidr) {
			isAllowed = (policy.Type == "allow")
			break
		}
	}

	// Return the result
	if isAllowed {
		c.JSON(http.StatusOK, gin.H{"message": "IP address is allowed"})
	} else {
		c.JSON(http.StatusOK, gin.H{"message": "IP address is blocked"})
	}
}

func handleNotFound(c *gin.Context, err error) bool {
	var notFoundErr custom.NotFoundError
	if errors.As(err, &notFoundErr) {
		logrus.Error("policy list not found: ", err)
		c.JSON(http.StatusNotFound, Response{Message: "policy list not found"})

		return true
	}
	return false
}
