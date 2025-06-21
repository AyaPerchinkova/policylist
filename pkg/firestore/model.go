package firestore

import "time"

type PolicyList struct {
	Username  string     `firestore:"username"`
	ID        string     `firestore:"id"`
	Ranges    []string   `firestore:"ranges"`
	Name      string     `firestore:"name"`
	Type      string     `firestore:"type"`
	Region    string     `firestore:"region"` // Add the region field
	Size      int        `firestore:"-"`
	CreatedAt *time.Time `firestore:"createdAt"`
	UpdatedAt *time.Time `firestore:"updatedAt"`
}

type User struct {
	ID        string     `json:"id" firestore:"id"`
	Username  string     `json:"username" firestore:"username"`
	Password  string     `json:"password" firestore:"password"` // Store hashed password
	Email     string     `json:"email" firestore:"email"`       // Optional email field
	CreatedAt *time.Time `json:"createdAt" firestore:"createdAt"`
	LastLogin *time.Time `json:"lastLogin" firestore:"lastLogin"` // Track last login time
}
