package middleware

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
	logrus "github.com/sirupsen/logrus"
)

var jwtSecret = []byte("*******") // Replace with your actual secret key

// JWTAuthMiddleware validates the JWT token and extracts claims
func JWTAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Log the incoming request
		logrus.Infof("Incoming request: %s %s", c.Request.Method, c.Request.URL.Path)

		// Get the Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			logrus.Warn("Authorization header is missing")
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Authorization header is missing"})
			c.Abort()
			return
		}
		logrus.Infof("Authorization header: %s", authHeader)
		// Extract the token from the header
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		logrus.Infof("Extracted token: %s", tokenString)

		// Check if the header starts with "Bearer "
		if !strings.HasPrefix(authHeader, "Bearer ") {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid token format"})
			c.Abort()
			return
		}

		// Parse and validate the token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			// Ensure the signing method is HMAC
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				logrus.Errorf("Unexpected signing method: %v", token.Header["alg"])
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return jwtSecret, nil
		})

		if err != nil {
			logrus.Errorf("Token parsing error: %v", err)
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid token", "error": err.Error()})
			c.Abort()
			return
		}

		// Extract claims and log them
		if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
			logrus.Infof("Token claims: %v", claims)
			if username, ok := claims["username"].(string); ok {
				logrus.Infof("Authenticated username: %s", username)
				c.Set("username", username) // Set the username in the context
			} else {
				logrus.Warn("Username claim is missing or invalid")
				c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid token claims"})
				c.Abort()
				return
			}
		} else {
			logrus.Warn("Invalid token claims")
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid token claims"})
			c.Abort()
			return
		}
		// Proceed to the next handler
		c.Next()
	}
}
