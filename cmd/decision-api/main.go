package main

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	config "github.tools.aya/aya/decisionCLI/cmd/decision-api/env"
	"github.tools.aya/aya/decisionCLI/cmd/decision-api/internal/decision"
	repository "github.tools.aya/aya/decisionCLI/pkg/firestore"
)

func main() {
	ctx := context.Background()

	client, err := firestore.NewClient(context.Background(), firestore.DetectProjectID)
	if err != nil {
		logrus.Infof("Error initializing Firebase app: %v", err)
	}

	f, err := config.LoadFirestoreConfig()
	if err != nil {
		logrus.Fatal(fmt.Errorf("error in the environment variable for collection ID in firestore: %w", err))
	}

	fs, err := repository.NewPolicyRepository(f.Collection, client)
	if err != nil {
		logrus.Fatal(fmt.Errorf("error initializing FirestoreDataGetter: %w", err))
	}

	userRepo, err := repository.NewUserRepository(f.UserCollection, client)
	if err != nil {
		logrus.Fatal(fmt.Errorf("error initializing UserRepository: %w", err))
	}

	// Pass the required arguments to NewPresenter
	pr := decision.NewPresenter(fs, *userRepo)
	router := gin.Default()

	router.POST("/checkIP/:id", pr.CheckIP) // Use the protected route

	r, err := config.LoadRESTConfig()
	if err != nil {
		logrus.Fatal(fmt.Errorf("error in the environment variable for server port: %w", err))
	}

	srv := &http.Server{
		Addr:    fmt.Sprintf("%s:%d", r.Host, r.Port),
		Handler: router,
	}
	go func() {
		logrus.Printf("Server listening on %s", srv.Addr)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			logrus.Fatalf("listen and serve returned err: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	defer client.Close()

	// Shutdown the server gracefully
	if err := srv.Shutdown(ctx); err != nil {
		logrus.Fatalf("problem in server shutting down: %v\n", err)
	}
	logrus.Println("Server shutdown gracefully")
}
