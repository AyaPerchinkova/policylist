package firestore

import (
	"context"
	"fmt"
	"log"
	"time"

	"cloud.google.com/go/firestore"
	"golang.org/x/crypto/bcrypt"
	"google.golang.org/api/iterator"
)

type UserRepository struct {
	Client     *firestore.Client
	Collection string
}

func NewUserRepository(collection string, client *firestore.Client) (*UserRepository, error) {
	if collection == "" {
		return nil, fmt.Errorf("empty collection name")
	}
	return &UserRepository{
		Client:     client,
		Collection: collection,
	}, nil
}

// CreateUser creates a new user in Firestore.
func (u *UserRepository) CreateUser(ctx context.Context, user User) (string, error) {
	// Hash the password before saving
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		return "", fmt.Errorf("failed to hash password: %w", err)
	}
	user.Password = string(hashedPassword)
	// Set default values for new fields
	now := time.Now()
	user.CreatedAt = &now
	user.LastLogin = nil // Last login is not set at creation
	// Use the username as the document ID
	docRef := u.Client.Collection(u.Collection).Doc(user.Username)
	user.ID = user.Username        // Set the ID to the username
	_, err = docRef.Set(ctx, user) // Use Set instead of Create to avoid conflicts
	if err != nil {
		return "", fmt.Errorf("failed to create user: %w", err)
	}
	return user.Username, nil
}

// GetUserByUsername retrieves a user by their username.
func (u *UserRepository) GetUserByUsername(ctx context.Context, username string) (User, error) {
	docRef := u.Client.Collection(u.Collection).Doc(username)
	doc, err := docRef.Get(ctx)
	if err != nil {
		return User{}, fmt.Errorf("user not found: %w", err)
	}

	var user User
	if err := doc.DataTo(&user); err != nil {
		return User{}, fmt.Errorf("failed to parse user data: %w", err)
	}
	user.ID = doc.Ref.ID
	return user, nil
}
func (ur *UserRepository) UserExists(ctx context.Context, username string) (bool, error) {
	// Query the UserCollection for the username
	query := ur.Client.Collection(ur.Collection).Where("username", "==", username).Limit(1)
	iter := query.Documents(ctx)
	defer iter.Stop()

	// Check if any document exists
	_, err := iter.Next()
	if err == iterator.Done {
		log.Printf("User %s does not exist", username)

		return false, nil // No user found
	}
	if err != nil {
		log.Printf("Error checking user existence for %s: %v", username, err)

		return false, err // Error occurred
	}
	return true, nil // User exists
}

func (u *UserRepository) UpdateLastLogin(ctx context.Context, username string) error {
	now := time.Now()
	_, err := u.Client.Collection(u.Collection).Doc(username).Update(ctx, []firestore.Update{
		{Path: "lastLogin", Value: now},
	})
	if err != nil {
		return fmt.Errorf("failed to update last login: %w", err)
	}
	return nil
}

func (u *UserRepository) UpdateUserActivity(ctx context.Context) error {
	// Get the current time
	now := time.Now()

	// Query all users
	iter := u.Client.Collection(u.Collection).Documents(ctx)
	defer iter.Stop()

	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			return fmt.Errorf("failed to iterate users: %w", err)
		}

		var user User
		if err := doc.DataTo(&user); err != nil {
			return fmt.Errorf("failed to parse user data: %w", err)
		}

		// Check if the user has been inactive for more than 24 hours
		if user.LastLogin != nil && now.Sub(*user.LastLogin) > 24*time.Hour {
			// Set Active to false
			_, err := doc.Ref.Update(ctx, []firestore.Update{
				{Path: "active", Value: false},
			})
			if err != nil {
				return fmt.Errorf("failed to update user activity: %w", err)
			}
		} else {
			// Set Active to true if the user is active
			_, err := doc.Ref.Update(ctx, []firestore.Update{
				{Path: "active", Value: true},
			})
			if err != nil {
				return fmt.Errorf("failed to update user activity: %w", err)
			}
		}
	}

	return nil
}
