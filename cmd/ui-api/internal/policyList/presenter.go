package decision

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"regexp"
	"time"

	f "cloud.google.com/go/firestore"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
	"github.com/sirupsen/logrus"
	custom "github.tools.aya/aya/decisionCLI/pkg/errors"
	"github.tools.aya/aya/decisionCLI/pkg/firestore"
	"golang.org/x/crypto/bcrypt"
	"google.golang.org/api/iterator"
)

const InternalServerErrMsg string = "Something went wrong. Please try again."

//go:generate mockgen --source=presenter.go --destination mocks/presenter.go --package mocks
type PolicyStorage interface {
	GetAll(ctx context.Context, policyListType string) ([]firestore.PolicyList, error)
	Create(ctx context.Context, username string, policyList firestore.PolicyList) (string, error)
	Delete(ctx context.Context, policyListID string) error
	Update(ctx context.Context, policyListID string, policyList firestore.PolicyList) error
}
type Presenter struct {
	//policyStorage PolicyStorage
	userRepo   *firestore.UserRepository
	policyRepo *firestore.PolicyRepository
}

func NewPresenter(userRepo *firestore.UserRepository, policyRepo *firestore.PolicyRepository) *Presenter {
	return &Presenter{
		userRepo:   userRepo,
		policyRepo: policyRepo,
	}
}

func (p *Presenter) getPolicyRepo(username string) (PolicyStorage, error) {
	// Define the user's policies subcollection path
	policyCollection := fmt.Sprintf("users/%s/policies", username)

	// Check if the collection exists by querying for at least one document
	iter := p.userRepo.Client.Collection(policyCollection).Limit(1).Documents(context.Background())
	_, err := iter.Next()
	if err == iterator.Done {
		// Collection is empty — create a dummy document to initialize it
		_, _, err := p.userRepo.Client.Collection(policyCollection).Add(context.Background(), map[string]interface{}{
			"__init":    true,
			"createdAt": time.Now(),
		})
		if err != nil {
			return nil, fmt.Errorf("failed to initialize collection: %w", err)
		}
		logrus.Infof("Initialized Firestore collection: %s", policyCollection)
	} else if err != nil {
		return nil, fmt.Errorf("failed to check collection existence: %w", err)
	}

	// Create the PolicyRepository for the user's policies subcollection
	repo, err := firestore.NewPolicyRepository(policyCollection, p.userRepo.Client)
	if err != nil {
		return nil, fmt.Errorf("failed to create policy repository: %w", err)
	}

	return repo, nil
}

func (p *Presenter) Create(c *gin.Context) {
	username, exists := c.Get("username")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
		return
	}
	var request PolicyList
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid input"})
		return
	}

	// Set the username to the logged-in user
	request.Username = username.(string)

	//docID, err := p.policyRepo.Create(c, toRepositoryPolicyList(request))
	docID, err := p.policyRepo.Create(c, username.(string), toRepositoryPolicyList(request))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to create policy"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Policy created successfully", "id": docID})
}

func (p *Presenter) Update(c *gin.Context) {
	docID := c.Param("id") // Get the policy ID from the URL
	if docID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Policy ID is required"})
		return
	}

	var request PolicyList
	log.Println(request)
	// Parse the JSON request body
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid input"})
		return
	}
	err := p.policyRepo.Update(c.Request.Context(), docID, toRepositoryPolicyList(request))
	if err != nil {
		if handleNotFound(c, err) {
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to update policy"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Policy updated successfully"})
}

func (p *Presenter) GetAll(c *gin.Context) {
	// Optional filter for policy type
	docType := c.Query("type")

	collectionRef := p.policyRepo.Client.Collection(os.Getenv("FIRESTORE_COLLECTION"))

	// Apply a query if a filter is provided
	var query f.Query
	if docType != "" {
		query = collectionRef.Where("type", "==", docType)
	} else {
		query = collectionRef.Query
	}

	// Fetch the policies
	iter := query.Documents(c)
	defer iter.Stop()

	var policies []map[string]interface{}
	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to fetch policies", "error": err.Error()})
			return
		}

		// Append the policy data to the result
		policy := doc.Data()
		policy["id"] = doc.Ref.ID // Include the document ID
		policies = append(policies, policy)
	}

	// Check if no policies were found
	if len(policies) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"message": "No policies found for user"})
		return
	}

	// Return the policies
	c.JSON(http.StatusOK, policies)
}

func (p *Presenter) Delete(c *gin.Context) {
	docID := c.Param("id")
	if docID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Policy ID is required"})
		return
	}
	// Delete from Firestore
	// Delete the policy from Firestore
	err := p.policyRepo.Delete(c.Request.Context(), docID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to delete policy", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, Response{Message: "List deleted successfully from Firestore and MongoDB."})
}
func (p *Presenter) Register(c *gin.Context) {
	var request struct {
		Username        string `json:"username" binding:"required"`
		Password        string `json:"password" binding:"required"`
		ConfirmPassword string `json:"confirmPassword" binding:"required"`
		Email           string `json:"email" binding:"required,email"` // Validate email format
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid input"})
		return
	}

	if request.Password != request.ConfirmPassword {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Passwords do not match"})
		return
	}

	// Validate the email using an external service
	isValidEmail, err := validateEmail(request.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to validate email", "error": err.Error()})
		return
	}
	if !isValidEmail {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid email address"})
		return
	}
	userExists, err := p.userRepo.UserExists(c.Request.Context(), request.Username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to check username availability", "error": err.Error()})
		return
	}
	if userExists {
		c.JSON(http.StatusConflict, gin.H{"message": "Username already exists"})
		return
	}
	// Create the user object
	now := time.Now()
	// Create the user object
	user := firestore.User{
		Username:  request.Username,
		Password:  request.Password,
		Email:     request.Email,
		CreatedAt: &now,
		LastLogin: nil, // Last login is not set at registration
	}

	userID, err := p.userRepo.CreateUser(c.Request.Context(), user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to register user", "error": err.Error()})
		return
	}

	// Generate JWT token
	token, err := GenerateJWT(user.Username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":  "User registered successfully",
		"userID":   userID,
		"username": user.Username,
		"email":    user.Email,
		"token":    token,
	})
}

func (p *Presenter) Login(c *gin.Context) {
	var request struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	// Parse and validate the JSON request body
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid input"})
		return
	}

	// 	// Check if the user exists in the database
	user, err := p.userRepo.GetUserByUsername(c, request.Username)
	if err != nil {
		logrus.Errorf("User not found: %s", request.Username)
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid username or password"})
		return
	}

	// Validate the password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(request.Password)); err != nil {
		logrus.Errorf("Password mismatch for user: %s", request.Username)
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid username or password"})
		return
	}

	// Update the last login timestamp
	if err := p.userRepo.UpdateLastLogin(c.Request.Context(), user.Username); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to update last login", "error": err.Error()})
		return
	}
	// Generate JWT token
	token, err := GenerateJWT(user.Username)
	if err != nil {
		logrus.Errorf("Failed to generate token for user: %s", user.Username)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to generate token"})
		return
	}

	logrus.Infof("Login successful for user: %s", request.Username)
	c.JSON(http.StatusOK, gin.H{
		"message":  "Login successful",
		"token":    token,
		"username": user.Username,
		"email":    user.Email,
	})
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

var jwtSecret = []byte("******") // Replace with a secure secret key

func GenerateJWT(username string) (string, error) {
	jwtSecret := []byte(os.Getenv("JWT_SECRET"))
	if len(jwtSecret) == 0 {
		logrus.Fatal("JWT_SECRET environment variable is not set")
	}

	logrus.Infof("Generating JWT for username: %s", username)

	claims := jwt.MapClaims{
		"username": username,
		"exp":      time.Now().Add(24 * time.Hour).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		logrus.Errorf("Failed to sign token: %v", err)
		return "", err
	}

	logrus.Infof("JWT token generated: %s", tokenString)
	return tokenString, nil
}

func validateEmail(email string) (bool, error) {
	// Define a regular expression for validating email format
	emailRegex := `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`

	// Compile the regex
	re := regexp.MustCompile(emailRegex)

	// Check if the email matches the regex
	if !re.MatchString(email) {
		return false, fmt.Errorf("invalid email format")
	}

	return true, nil
}
