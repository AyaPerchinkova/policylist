package restful_api_test

import (
	"context"
	"flag"
	"fmt"
	"os"
	"strconv"
	"testing"
	"time"

	"cloud.google.com/go/firestore"
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
	"github.com/onsi/gomega/gexec"
	"github.com/sirupsen/logrus"
	env "github.tools.aya/aya/decisionCLI/cmd/decision-api/env"
	"github.tools.aya/aya/decisionCLI/test/integration/util/app"
	fr "github.tools.aya/aya/decisionCLI/test/integration/util/firestore"
)

var suiteShouldRun = flag.Bool("integration", false, "should integration tests run?")

func TestRestfulApi(t *testing.T) {
	RegisterFailHandler(Fail)
	if !*suiteShouldRun {
		t.Skip("Skipping integration tests")
		return
	}
	RunSpecs(t, "RestfulApi Suite")
}

var (
	appProcess      *app.Process
	url             string
	fs              *fr.Repository
	ctx             context.Context
	firestoreConfig env.FirestoreConfig
	client          *firestore.Client
	err             error
)

var _ = BeforeSuite(func() {
	ctx = context.Background()
	client, err = firestore.NewClient(context.Background(), firestore.DetectProjectID)
	if err != nil {
		logrus.Errorf("Error initializing Firebase app: %v", err)
	}

	appConfig, err := env.LoadRESTConfig()
	Expect(err).ToNot(HaveOccurred())

	firestoreConfig, err = env.LoadFirestoreConfig()
	Expect(err).ToNot(HaveOccurred())

	appProcess, err = app.NewRESTAPIApp("github.tools.aya/aya/decisionCLI/cmd/decision-api").
		Start(GinkgoWriter, app.RESTAPIConfig{
			Host:              appConfig.Host,
			Port:              strconv.Itoa(appConfig.Port),
			Collection:        firestoreConfig.UserCollection,
			GoogleCredentials: os.Getenv("GOOGLE_APPLICATION_CREDENTIALS"),
		})

	Expect(appProcess).ToNot(BeNil())
	Expect(err).ToNot(HaveOccurred())

	fs, err = fr.NewRepository(firestoreConfig.UserCollection, client)
	Expect(err).ToNot(HaveOccurred())
	Expect(fs).ToNot(BeNil())

	url = fmt.Sprintf("http://%s:%d", appConfig.Host, appConfig.Port)
})
var _ = AfterSuite(func() {
	Expect(client.Close()).To(Succeed())
	Expect(appProcess.TerminateAndWait(10 * time.Second)).To(gexec.Exit(0))
}, float64(20*time.Second))
