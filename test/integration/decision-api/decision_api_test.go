package restful_api_test

import (
	"fmt"
	"net/http"

	"github.com/go-resty/resty/v2"
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
	fr "github.tools.aya/aya/decisionCLI/pkg/firestore"
)

var _ = Describe("RestfulApi", func() {

	const (
		prefix         = "checkIP"
		policyDocument = "policyDocument"
	)

	Context("/checkIP/:id", func() {
		BeforeEach(func() {
			policyList := fr.PolicyList{Ranges: []string{"10.20.0.0/22"}, Name: "sth", Type: "allow"}
			err := fs.CreateDocument(ctx, policyDocument, policyList)
			Expect(err).ToNot(HaveOccurred())
		})

		AfterEach(func() {
			err := fs.DeleteDocument(ctx, policyDocument)
			Expect(err).ToNot(HaveOccurred())
		})

		It("should serve POST requests", func() {
			Eventually(func() int {
				resp, _ := resty.New().R().
					SetHeader("Content-Type", "application/json").
					SetBody(`{"ip": "10.20.0.0"}`).
					Post(fmt.Sprintf("%s/%s/%s", url, prefix, policyDocument))
				return resp.StatusCode()
			}).Should(Equal(http.StatusOK))
		})
	})
})
