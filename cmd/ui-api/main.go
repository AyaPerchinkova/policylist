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
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	config "github.tools.aya/aya/decisionCLI/cmd/ui-api/env"
	policyList "github.tools.aya/aya/decisionCLI/cmd/ui-api/internal/policyList"

	fs "github.tools.aya/aya/decisionCLI/pkg/firestore"
	"github.tools.aya/aya/decisionCLI/pkg/middleware"
)

func main() {
	ctx := context.Background()
	client, err := firestore.NewClient(context.Background(), firestore.DetectProjectID)
	if err != nil {
		logrus.Infof("Error initializing Firebase app: %v", err)
	}

	firestoreConfig, err := config.LoadFirestoreConfig()
	if err != nil {
		logrus.Fatal(fmt.Errorf("error in the environment variable for collection ID in firestore: %w", err))
	}

	r, err := config.LoadRESTConfig()
	if err != nil {
		logrus.Fatal(fmt.Errorf("error in the environment variable for server port: %w", err))
	}

	// Initialize UserRepository
	userRepo, err := fs.NewUserRepository(firestoreConfig.UserCollection, client)
	if err != nil {
		logrus.Fatal(fmt.Errorf("error initializing Firestore user repository: %w", err))
	}
	// Initialize PolicyRepository for policies
	policyRepo, err := fs.NewPolicyRepository(firestoreConfig.Collection, client)
	if err != nil {
		logrus.Fatal(fmt.Errorf("error initializing Firestore policy repository: %w", err))
	}

	defer client.Close()

	// Load MongoDB configuration
	// mongoConfig, err := config.LoadMongoDBConfig()
	// if err != nil {
	// 	logrus.Fatal(fmt.Errorf("error in the environment variable for MongoDB URI: %w", err))
	// }

	// Initialize MongoDB client
	// mongoClient, err := mongo.Connect(ctx, options.Client().ApplyURI(mongoConfig.URI))
	// if err != nil {
	// 	logrus.Fatalf("Failed to connect to MongoDB: %v", err)
	// }
	// logrus.Infof("Connected to MongoDB")
	// defer func() {
	// 	if err := mongoClient.Disconnect(ctx); err != nil {
	// 		logrus.Fatalf("Failed to disconnect MongoDB: %v", err)
	// 	}
	// }()
	//mongoDB := mongoClient.Database("decisionDB")

	// Initialize Presenter with Firestore and MongoDB
	policyData := policyList.NewPresenter(userRepo, policyRepo)

	router := gin.Default()
	router.POST("/register", policyData.Register)
	router.POST("/login", policyData.Login)
	// config := cors.DefaultConfig()
	// //config.AllowAllOrigins = true
	// //config.AllowHeaders = []string{"Authorization", "Content-Type"}
	// config.AllowMethods = []string{"GET", "POST", "PATCH", "DELETE"}
	// config.AllowCredentials = true
	config := cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "AllowMethods", ""},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}

	router.Use(cors.New(config))

	// Public routes (no JWT required)
	// router.POST("/register", policyData.Register)
	// router.POST("/login", policyData.Login)
	//router.GET("/auth/check", policyData.CheckAuth)
	// for _, r := range router.Routes() {
	// 	fmt.Printf("Method: %s, Path: %s\n", r.Method, r.Path)
	// }

	protected := router.Group("/")
	protected.Use(middleware.JWTAuthMiddleware())
	logrus.Info("JWTMiddleware applied")

	protected.POST("/lists", policyData.Create)
	protected.PATCH("/lists/:id", policyData.Update)
	protected.GET("/lists", policyData.GetAll)
	protected.DELETE("/lists/:id", policyData.Delete)

	logrus.Infof("Server listening on %s:%d", "0.0.0.0", r.Port)

	srv := &http.Server{
		Addr:    fmt.Sprintf("%s:%d", r.Host, r.Port),
		Handler: router,
	}
	logrus.Infof("Server listening on %s:%d", "0.0.0.0", r.Port)

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

	// Shutdown the server gracefully
	if err := srv.Shutdown(ctx); err != nil {
		logrus.Fatalf("problem in server shutting down: %v\n", err)
	}
	logrus.Println("Server shutdown gracefully")
}
