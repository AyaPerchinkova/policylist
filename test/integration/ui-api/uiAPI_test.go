package uiAPI_test

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/go-resty/resty/v2"
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
	fr "github.tools.aya/aya/decisionCLI/pkg/firestore"
	repo "github.tools.aya/aya/decisionCLI/test/integration/util/firestore"
)

var _ = Describe("UiAPI", func() {

	const (
		prefix = "lists"
	)

	var (
		policyList   fr.PolicyList
		resp         *resty.Response
		policyListID string
		id           repo.CreatePolicyResp
	)

	BeforeEach(func() {
		policyListID = "docID"
		policyList = fr.PolicyList{Ranges: []string{"10.20.0.0/22"}, Name: "sth", Type: "allow"}
	})

	When("Create /lists", func() {

		AfterEach(func() {
			err := fs.DeleteDocument(ctx, id.Name)
			Expect(err).ToNot(HaveOccurred())

		})
		It("should serve POST request", func() {
			Eventually(func() int {
				resp, _ = resty.New().R().
					SetHeader("Content-Type", "application/json").
					SetBody(`{"ranges": ["10.20.0.0/22"],"name":"test","type": "block"}`).
					Post(fmt.Sprintf("%s/%s", url, prefix))

				return resp.StatusCode()

			}).Should(Equal(http.StatusCreated))

			err := json.Unmarshal(resp.Body(), &id)
			Expect(err).To(Not(HaveOccurred()))
		})
	})

	When("Delete  /lists/:docID", func() {
		BeforeEach(func() {
			err := fs.CreateDocument(ctx, policyListID, policyList)
			Expect(err).ToNot(HaveOccurred())
		})

		It("should serve DELETE request", func() {
			Eventually(func() int {
				resp, _ := resty.New().R().
					SetHeader("Content-Type", "application/json").
					Delete(fmt.Sprintf("%s/%s/%s", url, prefix, policyListID))
				return resp.StatusCode()
			}).Should(Equal(http.StatusOK))
		})
	})

	When("Update /lists/docID", func() {
		BeforeEach(func() {
			err := fs.CreateDocument(ctx, policyListID, policyList)
			Expect(err).ToNot(HaveOccurred())
		})

		AfterEach(func() {
			err := fs.DeleteDocument(ctx, policyListID)
			Expect(err).ToNot(HaveOccurred())
		})

		It("should serve UPDATE request", func() {
			Eventually(func() int {
				resp, _ = resty.New().R().
					SetHeader("Content-Type", "application/json").
					SetBody(`{"ranges": ["10.20.0.0/22"],"name":"test","type": "block"}`).
					Patch(fmt.Sprintf("%s/%s/%s", url, prefix, policyListID))
				return resp.StatusCode()
			}).Should(Equal(http.StatusOK))
		})
	})

	When("Get", func() {
		BeforeEach(func() {
			err := fs.CreateDocument(ctx, policyListID, policyList)
			Expect(err).ToNot(HaveOccurred())
		})

		AfterEach(func() {
			err := fs.DeleteDocument(ctx, policyListID)
			Expect(err).ToNot(HaveOccurred())
		})

		When("/lists", func() {
			It("should serve GET request", func() {
				Eventually(func() int {
					resp, _ = resty.New().R().
						Get(fmt.Sprintf("%s/%s", url, prefix))
					return resp.StatusCode()
				}).Should(Equal(http.StatusOK))
			})
		})

		When("lists?type=allow", func() {
			It("should serve GET request", func() {
				Eventually(func() int {
					resp, _ = resty.New().R().
						Get(fmt.Sprintf("%s/%s?%s", url, prefix, policyList.Type))
					return resp.StatusCode()
				}).Should(Equal(http.StatusOK))
			})
		})

		When("lists?type=block", func() {
			BeforeEach(func() {
				err := fs.CreateDocument(ctx, "anotherDoc", policyList)
				Expect(err).ToNot(HaveOccurred())
			})

			AfterEach(func() {
				err := fs.DeleteDocument(ctx, "anotherDoc")
				Expect(err).ToNot(HaveOccurred())
			})

			It("should serve GET request", func() {
				Eventually(func() int {
					resp, _ = resty.New().R().
						Get(fmt.Sprintf("%s/%s?%s", url, prefix, policyList.Type))
					return resp.StatusCode()
				}).Should(Equal(http.StatusOK))
			})
		})
	})
})
