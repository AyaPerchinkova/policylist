package firestore

import (
	"context"
	"fmt"

	"cloud.google.com/go/firestore"
)

type Repository struct {
	Client     *firestore.Client
	Collection string
}

func NewRepository(collection string, client *firestore.Client) (*Repository, error) {
	if collection == "" {
		return nil, fmt.Errorf("empty collection name")
	}
	return &Repository{
		Client:     client,
		Collection: collection,
	}, nil
}
func (f *Repository) DeleteDocument(ctx context.Context, docID string) error {

	docRef := f.Client.Collection(f.Collection).Doc(docID)
	_, err := docRef.Delete(ctx)
	return err
}

func (f *Repository) CreateDocument(ctx context.Context, docID string, data interface{}) error {

	docRef := f.Client.Collection(f.Collection).Doc(docID)
	_, err := docRef.Create(ctx, data)
	return err
}

type CreatePolicyResp struct {
	Name string `firestore:"name"`
}
