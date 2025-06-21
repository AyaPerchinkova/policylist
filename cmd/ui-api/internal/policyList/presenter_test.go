package decision_test

// "encoding/json"
// "fmt"
// "net/http"
// "net/http/httptest"
// "strings"

// "github.com/gin-gonic/gin"
// "github.com/golang/mock/gomock"
// . "github.com/onsi/ginkgo/v2"
// . "github.com/onsi/gomega"
// policy "github.tools.aya/aya/decisionCLI/cmd/ui-api/internal/policyList"
// "github.tools.aya/aya/decisionCLI/cmd/ui-api/internal/policyList/mocks"
// "github.tools.aya/aya/decisionCLI/pkg/firestore"

// var _ = Describe("Presenter", func() {

// 	const (
// 		errorMsg            = "error"
// 		internalServerError = "Something went wrong. Please try again."
// 		policyListsEndpoint = "/lists"
// 	)
// 	var (
// 		// ctrl           *gomock.Controller
// 		// mockPolicyList *mocks.MockPolicyStorage
// 		// presenter      *policy.Presenter
// 		// c              *gin.Context
// 		// recorder       *httptest.ResponseRecorder
// 		// ranges         []string
// 		// policyList     firestore.PolicyList
// 		// policyLists    []firestore.PolicyList
// 		// listID         string
// 	)

// 	// BeforeEach(func() {
// 	// 	ctrl = gomock.NewController(GinkgoT())
// 	// 	mockPolicyList = mocks.NewMockPolicyStorage(ctrl)
// 	// 	// Create a mock or real instance of *firestore.UserRepository as needed
// 	// 	var mockUserRepository *firestore.UserRepository // Replace with actual initialization if required
// 	// 	presenter = policy.NewPresenter(mockPolicyList, mockUserRepository)
// 	// 	recorder = httptest.NewRecorder()
// 	// 	c, _ = gin.CreateTestContext(recorder)

// 	// 	ranges = []string{"10.0.0.0/1", "192.168.0.0/24", "203.0.113.0/24"}
// 	// 	policyList = firestore.PolicyList{Name: "test", Ranges: ranges, Type: "allow"}

// 	// 	policyLists = []firestore.PolicyList{policyList}
// 	// 	listID = "listID"
// 	// })

// 	// AfterEach(func() {
// 	// 	ctrl.Finish()
// 	// })

// 	// Context("Get", func() {
// 	// 	BeforeEach(func() {
// 	// 		requestBody := map[string]string{
// 	// 			"type": "allow",
// 	// 		}
// 	// 		jsonBody, _ := json.Marshal(requestBody)
// 	// 		request := httptest.NewRequest("GET", "/lists?type=allow", strings.NewReader(string(jsonBody)))
// 	// 		c.Request = request
// 	// 	})

// 	// 	When("getting lists succeeds", func() {
// 	// 		BeforeEach(func() {
// 	// 			mockPolicyList.EXPECT().GetAll(c, "allow").Return(policyLists, nil)
// 	// 		})
// 	// 		It("should return http.StatusOk", func() {
// 	// 			presenter.GetAll(c)
// 	// 			var response []policy.PolicyList
// 	// 			err := json.Unmarshal(recorder.Body.Bytes(), &response)
// 	// 			Expect(err).ToNot(HaveOccurred())

// 	// 			Expect(recorder.Code).To(Equal(http.StatusOK))
// 	// 			Expect(response[0].Ranges).To(Equal(ranges))
// 	// 			Expect(response[0].Type).To(Equal("allow"))
// 	// 			Expect(response[0].Name).To(Equal("test"))
// 	// 		})
// 	// 	})

// 	// 	When("getting lists fails", func() {
// 	// 		BeforeEach(func() {
// 	// 			mockPolicyList.EXPECT().GetAll(c, "allow").Return(nil, fmt.Errorf(errorMsg))
// 	// 		})
// 	// 		It("should return http.StatusInternalServerError", func() {
// 	// 			presenter.GetAll(c)
// 	// 			Expect(recorder.Code).To(Equal(http.StatusInternalServerError))
// 	// 			Expect(recorder.Body.String()).To(ContainSubstring(internalServerError))
// 	// 		})
// 	// 	})
// 	// })

// 	// Context("Create", func() {
// 	// 	BeforeEach(func() {
// 	// 		requestBody := `{"name":"test","ranges":["10.0.0.0/1", "192.168.0.0/24", "203.0.113.0/24"],"type":"allow"}`
// 	// 		request := httptest.NewRequest("POST", policyListsEndpoint, strings.NewReader(requestBody))
// 	// 		c.Request = request
// 	// 	})

// 	// 	When("request body is invalid", func() {
// 	// 		BeforeEach(func() {
// 	// 			requestBody := `{ranges='10.10.10.10/8"}`
// 	// 			request := httptest.NewRequest("POST", policyListsEndpoint, strings.NewReader(requestBody))
// 	// 			c.Request = request
// 	// 		})

// 	// 		It("should return error for http.StatusBadRequest", func() {
// 	// 			presenter.Create(c)
// 	// 			Expect(recorder.Code).To(Equal(http.StatusBadRequest))
// 	// 			Expect(recorder.Body.String()).To(ContainSubstring("Invalid body."))
// 	// 		})
// 	// 	})

// 	// 	When("creating list fails", func() {
// 	// 		BeforeEach(func() {
// 	// 			mockPolicyList.EXPECT().Create(c, policyList).Return("", fmt.Errorf(errorMsg))
// 	// 		})

// 	// 		It("should return http.StatusInternalServerError", func() {
// 	// 			presenter.Create(c)

// 	// 			Expect(recorder.Code).To(Equal(http.StatusInternalServerError))
// 	// 			Expect(recorder.Body.String()).To(ContainSubstring(internalServerError))
// 	// 		})
// 	// 	})

// 	// 	When("creating list succeeds", func() {
// 	// 		BeforeEach(func() {
// 	// 			mockPolicyList.EXPECT().Create(c, policyList).Return("id", nil)
// 	// 		})

// 	// 		It("should return http.StatusCreated", func() {
// 	// 			presenter.Create(c)

// 	// 			Expect(recorder.Code).To(Equal(http.StatusCreated))
// 	// 			Expect(recorder.Body.String()).To(ContainSubstring("List created successfully."))
// 	// 		})
// 	// 	})
// 	// })
// 	// Context("Delete", func() {
// 	// 	BeforeEach(func() {
// 	// 		c.Params = []gin.Param{
// 	// 			{
// 	// 				Key:   "id",
// 	// 				Value: listID,
// 	// 			},
// 	// 		}
// 	// 	})

// 	// 	When("deleting list fails", func() {
// 	// 		BeforeEach(func() {
// 	// 			mockPolicyList.EXPECT().Delete(c, listID).Return(fmt.Errorf(errorMsg))
// 	// 		})

// 	// 		It("should return http.StatusInternalServerError", func() {
// 	// 			presenter.Delete(c)

// 	// 			Expect(recorder.Code).To(Equal(http.StatusInternalServerError))
// 	// 			Expect(recorder.Body.String()).To(ContainSubstring(internalServerError))
// 	// 		})
// 	// 	})

// 	// 	When("deleting list succeeds", func() {
// 	// 		BeforeEach(func() {
// 	// 			mockPolicyList.EXPECT().Delete(c, listID).Return(nil)
// 	// 		})

// 	// 		It("should return http.StatusOK", func() {
// 	// 			presenter.Delete(c)

// 	// 			Expect(recorder.Code).To(Equal(http.StatusOK))
// 	// 			Expect(recorder.Body.String()).To(ContainSubstring("List deleted successfully."))
// 	// 		})
// 	// 	})

// 	// })
// 	// Context("Update", func() {
// 	// 	BeforeEach(func() {
// 	// 		requestBody := `{"name":"test","ranges": ["10.0.0.0/1", "192.168.0.0/24", "203.0.113.0/24"],"type":"allow"}`
// 	// 		request := httptest.NewRequest("PATCH", policyListsEndpoint, strings.NewReader(requestBody))
// 	// 		c.Params = []gin.Param{
// 	// 			{
// 	// 				Key:   "id",
// 	// 				Value: listID,
// 	// 			},
// 	// 		}
// 	// 		c.Request = request
// 	// 	})

// 	// 	When("request body is invalid", func() {
// 	// 		BeforeEach(func() {
// 	// 			requestBody := `{"ranges":'10.10.10.10/8"}`
// 	// 			req := httptest.NewRequest("PATCH", policyListsEndpoint, strings.NewReader(requestBody))
// 	// 			c.Request = req
// 	// 		})

// 	// 		It("should return http.StatusBadRequest", func() {
// 	// 			presenter.Update(c)
// 	// 			Expect(recorder.Code).To(Equal(http.StatusBadRequest))
// 	// 			Expect(recorder.Body.String()).To(ContainSubstring("Invalid body."))
// 	// 		})
// 	// 	})

// 	// 	When("updating list fails", func() {
// 	// 		BeforeEach(func() {
// 	// 			mockPolicyList.EXPECT().Update(c, listID, policyList).Return(fmt.Errorf(errorMsg))
// 	// 		})

// 	// 		It("should return http.StatusInternalServerError", func() {
// 	// 			presenter.Update(c)

// 	// 			Expect(recorder.Code).To(Equal(http.StatusInternalServerError))
// 	// 			Expect(recorder.Body.String()).To(ContainSubstring(internalServerError))
// 	// 		})
// 	// 	})

// 	// 	When("updating list succeeds", func() {
// 	// 		BeforeEach(func() {
// 	// 			mockPolicyList.EXPECT().Update(c, listID, policyList).Return(nil)
// 	// 		})

// 	// 		It("should return http.StatusOK", func() {
// 	// 			presenter.Update(c)

// 	// 			Expect(recorder.Code).To(Equal(http.StatusOK))
// 	// 			Expect(recorder.Body.String()).To(ContainSubstring("List updated successfully."))
// 	// 		})
// 	// 	})
// 	// })

// })
