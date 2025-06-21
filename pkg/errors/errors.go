package errors

import "fmt"

type NotFoundError struct {
	message string
}

// NewNotFoundError accepts message
// Returns a new instance of not found error
func NewNotFoundError(message string) NotFoundError {
	return NotFoundError{
		message: message,
	}
}

// Error
// Returns formatted message containing the not found resource
func (e NotFoundError) Error() string {
	return fmt.Sprintf("not found: %s", e.message)
}
