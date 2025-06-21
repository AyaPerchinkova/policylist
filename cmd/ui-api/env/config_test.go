package config_test

import (
	"os"
	"strconv"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
	config "github.tools.aya/aya/decisionCLI/cmd/ui-api/env"
)

var _ = Describe("Config", func() {

	const (
		serveHostEnv           = "SERVER_HOST"
		serverPortEnv          = "SERVER_PORT"
		serverHost             = "host"
		serverPort             = 8080
		firestoreCollection    = "firestoreCollection"
		firestoreCollectionEnv = "FIRESTORE_COLLECTION"
	)

	Context("LoadRESTConfig", func() {

		BeforeEach(func() {
			Expect(os.Setenv(serveHostEnv, serverHost)).To(Succeed())
			Expect(os.Setenv(serverPortEnv, strconv.Itoa(serverPort))).To(Succeed())
		})

		AfterEach(func() {
			Expect(os.Unsetenv(serveHostEnv)).To(Succeed())
			Expect(os.Unsetenv(serverPortEnv)).To(Succeed())
		})

		When("port is set", func() {
			It("should assign successfully", func() {
				config, err := config.LoadRESTConfig()
				Expect(err).ToNot(HaveOccurred())
				Expect(config.Port).To(Equal(serverPort))
			})
		})

		When("port is not set", func() {
			BeforeEach(func() {
				Expect(os.Unsetenv(serverPortEnv)).To(Succeed())
			})

			It("should assign the port the  default value of '8181'", func() {
				config, err := config.LoadRESTConfig()
				Expect(err).ToNot(HaveOccurred())
				Expect(config.Port).To(Equal(8181))
			})
		})

		When("envconfig.Process returns an error", func() {
			BeforeEach(func() {
				Expect(os.Setenv(serverPortEnv, "invalidPort")).To(Succeed())
			})

			It("should return an error", func() {
				_, err := config.LoadRESTConfig()
				Expect(err).To(HaveOccurred())
				Expect(err.Error()).To(ContainSubstring("error in populating the rest configuration"))
			})
		})

		When("host is set", func() {
			It("should assign successfully", func() {
				config, err := config.LoadRESTConfig()
				Expect(err).ToNot(HaveOccurred())
				Expect(config.Host).To(Equal(serverHost))
			})
		})

		When("host is not set", func() {
			BeforeEach(func() {
				Expect(os.Unsetenv(serveHostEnv)).To(Succeed())
				Expect(os.Setenv(serveHostEnv, "localhost")).To(Succeed())
			})

			It("should assign the host the default value of 'localhost'", func() {
				config, err := config.LoadRESTConfig()
				Expect(err).ToNot(HaveOccurred())
				Expect(config.Host).To(Equal("localhost"))
			})
		})
	})

	Context("LoadFirestoreConfig", func() {

		BeforeEach(func() {
			Expect(os.Setenv(firestoreCollectionEnv, firestoreCollection)).To(Succeed())
		})

		AfterEach(func() {
			Expect(os.Unsetenv(firestoreCollectionEnv)).To(Succeed())
		})

		When("firestore collection is not set", func() {
			BeforeEach(func() {
				Expect(os.Unsetenv(firestoreCollectionEnv)).To(Succeed())
			})
			It("should return error", func() {
				_, err := config.LoadFirestoreConfig()
				Expect(err).To(HaveOccurred())
			})
		})
	})
})
