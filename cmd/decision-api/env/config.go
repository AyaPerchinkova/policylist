package config

import (
	"fmt"

	"github.com/kelseyhightower/envconfig"
)

type RESTConfig struct {
	Host string `envconfig:"SERVER_HOST" default:"localhost"`
	Port int    `envconfig:"SERVER_PORT" default:"8181"`
}

type FirestoreConfig struct {
	Collection     string `envconfig:"FIRESTORE_COLLECTION" required:"true"`
	UserCollection string `envconfig:"FIRESTORE_USER_COLLECTION" required:"true"`
}

type MongoDBConfig struct {
	URI string `envconfig:"MONGODB_URI" required:"true"`
}

// It returns the server configuration
func LoadRESTConfig() (RESTConfig, error) {
	var restConfig RESTConfig
	if err := envconfig.Process("", &restConfig); err != nil {
		return RESTConfig{}, fmt.Errorf("error in populating the rest configuration: %w", err)
	}
	return restConfig, nil
}

// It returns the firestore collection configuration
func LoadFirestoreConfig() (FirestoreConfig, error) {
	var firestoreConfig FirestoreConfig
	if err := envconfig.Process("", &firestoreConfig); err != nil {
		return FirestoreConfig{}, fmt.Errorf("error in populating the specified firestore configuration: %w", err)
	}
	return firestoreConfig, nil
}

// It returns the MongoDB configuration
func LoadMongoDBConfig() (MongoDBConfig, error) {
	var mongoDBConfig MongoDBConfig
	if err := envconfig.Process("", &mongoDBConfig); err != nil {
		return MongoDBConfig{}, fmt.Errorf("error in populating the MongoDB configuration: %w", err)
	}
	return mongoDBConfig, nil
}
