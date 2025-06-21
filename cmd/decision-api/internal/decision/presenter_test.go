package decision

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang/mock/gomock"
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
	"github.tools.aya/aya/decisionCLI/cmd/decision-api/internal/decision/mocks"
	"github.tools.aya/aya/decisionCLI/pkg/firestore"
	// "go.mongodb.org/mongo-driver/mongo"
)

var _ = Describe("Decision", func() {

	var (
		ctrl         *gomock.Controller
		mockIPRanges *mocks.MockPolicyList
		presenter    *Presenter
		c            *gin.Context
		recorder     *httptest.ResponseRecorder
		ranges       []string
		policyListID string
		policyList   firestore.PolicyList
		userID       string
	)

	BeforeEach(func() {
		ctrl = gomock.NewController(GinkgoT())
		mockIPRanges = mocks.NewMockPolicyList(ctrl)
		// mockDB := &mongo.Database{} // Mock or initialize a mongo.Database instance as needed
		// presenter = NewPresenter(mockIPRanges, mockDB)
		recorder = httptest.NewRecorder()
		c, _ = gin.CreateTestContext(recorder)
		ranges = []string{"10.20.0.0/22", "192.168.0.0/24"}
		policyList = firestore.PolicyList{Ranges: ranges, Name: "testPresenter", Type: "allow"}
		policyListID = "docID"
		userID = "testUser"       // Mock userID
		c.Set("username", userID) // Set the userID in the Gin context
	})

	AfterEach(func() {
		ctrl.Finish()
	})

	Context("CheckIP", func() {

		BeforeEach(func() {
			request := `{"ip":"10.20.0.0"}`
			req := httptest.NewRequest("POST", "/checkIP/", strings.NewReader(request))
			c.Params = []gin.Param{
				{
					Key:   "id",
					Value: policyListID,
				},
			}
			c.Request = req
		})
		When("CIDR is invalid", func() {
			BeforeEach(func() {
				mockIPRanges.EXPECT().Get(c, policyListID).Return(firestore.PolicyList{Ranges: []string{"1928.168.0.0/24"}, Name: "CIDRError", Type: "allow"}, nil).Times(1)
			})
			It("should handle invalid CIDR format", func() {
				presenter.CheckIP(c)

				Expect(recorder.Code).To(Equal(http.StatusInternalServerError))
				Expect(recorder.Body.String()).To(ContainSubstring("An error occurred. Please try again later"))
			})
		})

		When("IP is invalid", func() {
			BeforeEach(func() {
				requestBody := `{:'10.20.0"}`
				req := httptest.NewRequest("POST", "/checkIP/", strings.NewReader(requestBody))
				c.AddParam("id", policyListID)
				c.Request = req
			})

			It("should handle invalid IP address format", func() {
				presenter.CheckIP(c)

				Expect(recorder.Code).To(Equal(http.StatusBadRequest))
				Expect(recorder.Body.String()).To(ContainSubstring("Invalid body."))
			})
		})

		When("getting IP ranges returns an error", func() {
			BeforeEach(func() {
				mockIPRanges.EXPECT().Get(c, policyListID).Return(firestore.PolicyList{}, errors.New("error")).AnyTimes()
			})
			It("should handle Get error", func() {
				presenter.CheckIP(c)

				Expect(recorder.Code).To(Equal(http.StatusInternalServerError))
				Expect(recorder.Body.String()).To(ContainSubstring("Sorry, something got wrong"))
			})
		})

		When("IP is with type 'allow' and not contained", func() {
			BeforeEach(func() {
				requestBody := `{"ip":"10.0.0.0"}`
				req := httptest.NewRequest("POST", "/checkIP/", strings.NewReader(requestBody))
				c.AddParam("id", policyListID)
				c.Request = req
				mockIPRanges.EXPECT().Get(c, policyListID).Return(policyList, nil).AnyTimes()
			})

			It("should return blocked IP", func() {
				presenter.CheckIP(c)
				Expect(recorder.Code).To(Equal(http.StatusOK))
				Expect(recorder.Body.String()).To(ContainSubstring("IP address is allowed"))
			})
		})
		When("IP is with type 'block' and not contained", func() {
			BeforeEach(func() {
				requestBody := `{"ip":"10.0.0.0"}`
				req := httptest.NewRequest("POST", "/checkIP/", strings.NewReader(requestBody))
				c.AddParam("id", policyListID)
				c.Request = req
				policyList.Type = "block"
				mockIPRanges.EXPECT().Get(c, policyListID).Return(policyList, nil).AnyTimes()
			})

			It("should return allowed IP", func() {
				presenter.CheckIP(c)
				Expect(recorder.Code).To(Equal(http.StatusOK))
				Expect(recorder.Body.String()).To(ContainSubstring("IP address is blocked"))
			})
		})
		When("IP is with type 'block' and contained", func() {
			BeforeEach(func() {
				requestBody := `{"ip":"10.20.0.0"}`
				req := httptest.NewRequest("POST", "/checkIP/", strings.NewReader(requestBody))
				c.AddParam("id", policyListID)
				c.Request = req

				policyList.Type = "block"
				mockIPRanges.EXPECT().Get(c, policyListID).Return(policyList, nil).AnyTimes()
			})

			It("should return blocked IP", func() {
				presenter.CheckIP(c)
				Expect(recorder.Code).To(Equal(http.StatusOK))
				Expect(recorder.Body.String()).To(ContainSubstring("IP address is allowed"))
			})
		})

		When("IP is with type 'block' and contained", func() {
			BeforeEach(func() {
				requestBody := `{"ip":"10.20.0.0"}`
				req := httptest.NewRequest("POST", "/checkIP/", strings.NewReader(requestBody))
				c.AddParam("id", policyListID)
				c.Request = req
				mockIPRanges.EXPECT().Get(c, policyListID).Return(policyList, nil).AnyTimes()
			})

			It("should return allowed IP", func() {
				presenter.CheckIP(c)
				Expect(recorder.Code).To(Equal(http.StatusOK))
				Expect(recorder.Body.String()).To(ContainSubstring("IP address is blocked"))
			})
		})
	})
})
