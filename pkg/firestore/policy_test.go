package firestore_test

import (
	"context"

	"cloud.google.com/go/firestore"
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
	fs "github.tools.aya/aya/decisionCLI/pkg/firestore"
)

var _ = Describe("Policy", func() {

	const (
		collection = "collection"
		document   = "testDocument"
	)
	var (
		client        *firestore.Client
		err           error
		fr            *fs.PolicyRepository
		expectedRange []string
		ctx           context.Context
		// policyLists   []fs.PolicyList
		policyList fs.PolicyList
	)

	BeforeEach(func() {
		ctx = context.Background()
		client, err = firestore.NewClient(ctx, "a")
		Expect(err).To(BeNil())
		fr, err = fs.NewPolicyRepository(collection, client)
		Expect(err).ToNot(HaveOccurred())
		expectedRange = []string{"10.0.0.0/1", "203.0.113.0/24"}
		policyList = fs.PolicyList{ID: document, Ranges: expectedRange, Name: "test", Type: "allow"}
		// policyLists = []fs.PolicyList{policyList}
		_, err = client.Collection(collection).Doc(document).Set(ctx, fs.PolicyList{Ranges: policyList.Ranges, Name: policyList.Name, Type: policyList.Type})
		Expect(err).ToNot(HaveOccurred())
	})

	Context("FirestoreDataGetter", func() {
		When("collection empty", func() {
			It("should return empty PolicyList and an error", func() {
				fr, err = fs.NewPolicyRepository("", client)
				Expect(fr).To(BeNil())
				Expect(err).To(HaveOccurred())
				Expect(err.Error()).To(ContainSubstring("empty collection"))
			})
		})
	})

	Context("GetAll", func() {

		AfterEach(func() {
			collectionRef := client.Collection(fr.Collection)
			docs, err := collectionRef.Documents(ctx).GetAll()
			Expect(err).ToNot(HaveOccurred())
			for _, doc := range docs {
				_, err = doc.Ref.Delete(ctx)
			}
			Expect(err).ToNot(HaveOccurred())
			client.Close()
		})

		When("collection and type are valid", func() {
			// It("should return the expected PolicyList", func() {
			// 	ranges, err := fr.GetAll(ctx, "allow")
			// 	Expect(err).ToNot(HaveOccurred())
			// 	Expect(ranges).To(Equal(policyLists))
			// })
		})

		When("collection is invalid", func() {
			BeforeEach(func() {
				collection := "invalid"
				fr, err = fs.NewPolicyRepository(collection, client)
				Expect(err).ToNot(HaveOccurred())
			})

			// It("should return nil PolicyList", func() {
			// 	ranges, err := fr.GetAll(ctx, "allow")
			// 	Expect(ranges).To(BeNil())
			// 	Expect(err).To(BeNil())
			// })
		})

		When("type is not given", func() {
			// It("should return PolicyList and no error", func() {
			// 	ranges, err := fr.GetAll(ctx, "")
			// 	Expect(err).To(BeNil())
			// 	Expect(ranges).To(Equal(policyLists))
			// })
		})

		When("PolicyList data is invalid", func() {
			BeforeEach(func() {
				_, err = client.Collection(collection).Doc(document).Set(ctx, map[string]interface{}{
					"ranges": []int{1, 2},
					"name":   "test",
					"type":   "allow",
				})
			})

			// It("should return nil ranges and an error", func() {
			// 	ranges, err := fr.GetAll(ctx, "allow")
			// 	Expect(err).To(HaveOccurred())
			// 	Expect(err.Error()).To(ContainSubstring("error deserializing document data"))
			// 	Expect(ranges).To(BeNil())
			// })
		})
	})

	Context("Delete", func() {
		When("deleting reaches success", func() {
			AfterEach(func() {
				collectionRef := client.Collection(fr.Collection)
				docs, err := collectionRef.Documents(ctx).GetAll()
				Expect(err).ToNot(HaveOccurred())
				for _, doc := range docs {
					_, err = doc.Ref.Delete(ctx)
				}
				Expect(err).ToNot(HaveOccurred())
				client.Close()
			})

			It("should delete with no error returned", func() {
				err := fr.Delete(ctx, document)
				Expect(err).ToNot(HaveOccurred())
			})
		})

		When("deleting doesn not reach success", func() {
			BeforeEach(func() {
				collectionRef := client.Collection(fr.Collection)
				docs, err := collectionRef.Documents(ctx).GetAll()
				Expect(err).ToNot(HaveOccurred())
				for _, doc := range docs {
					_, err = doc.Ref.Delete(ctx)
				}
				Expect(err).ToNot(HaveOccurred())
				client.Close()
			})

			It("should return error for already deleted document", func() {
				err := fr.Delete(ctx, document)
				Expect(err).To(HaveOccurred())
			})
		})
	})

	Context("Create", func() {
		AfterEach(func() {
			collectionRef := client.Collection(fr.Collection)
			docs, err := collectionRef.Documents(ctx).GetAll()
			Expect(err).ToNot(HaveOccurred())
			for _, doc := range docs {
				_, err = doc.Ref.Delete(ctx)
			}
			Expect(err).ToNot(HaveOccurred())
			client.Close()
		})

		When("creating PolicyList is successful", func() {
			It("should return no error and PolicyList ID", func() {
				ranges, err := fr.Create(ctx, document, fs.PolicyList{Ranges: policyList.Ranges, Name: policyList.Name, Type: policyList.Type})
				Expect(ranges).ToNot(BeNil())
				Expect(err).ToNot(HaveOccurred())
			})
		})
	})

	Context("Update", func() {

		When("updating PolicyList is successful", func() {
			It("should return no error", func() {
				err = fr.Update(ctx, document, fs.PolicyList{Ranges: policyList.Ranges, Name: policyList.Name, Type: policyList.Type})
				Expect(err).To(BeNil())
			})
		})

		When("updating PolicyList is not successful", func() {
			It("should return no error", func() {
				err = fr.Update(ctx, "", fs.PolicyList{Ranges: expectedRange, Name: "inavlid", Type: "allow"})
				Expect(err).ToNot(BeNil())
			})
		})
	})

	Context("Get", func() {
		AfterEach(func() {
			collectionRef := client.Collection(fr.Collection)
			docs, err := collectionRef.Documents(ctx).GetAll()
			Expect(err).ToNot(HaveOccurred())
			for _, doc := range docs {
				_, err = doc.Ref.Delete(ctx)
			}
			Expect(err).ToNot(HaveOccurred())
			client.Close()
		})

		When("document is valid", func() {
			It("should return no error and PolicyList", func() {
				policy, err := fr.Get(ctx, document)
				Expect(err).ToNot(HaveOccurred())
				Expect(policy).To(Equal(policyList))
			})
		})

		When("document is with invalid data", func() {
			BeforeEach(func() {
				_, err = client.Collection(collection).Doc(document).Set(ctx, map[string]interface{}{
					"ranges": []int{1, 2},
					"name":   "test",
					"type":   "allow",
				})
				Expect(err).ToNot(HaveOccurred())
			})

			It("should return an error and empty PolicyList", func() {
				ranges, err := fr.Get(ctx, document)
				Expect(err).To(HaveOccurred())
				Expect(ranges).To(Equal(fs.PolicyList{}))
			})
		})

		When("document is with invalid data", func() {
			BeforeEach(func() {
				_, err = client.Collection(collection).Doc(document).Set(ctx, map[string]interface{}{
					"ranges": []int{1, 2},
					"name":   "test",
					"type":   "allow",
				})
				Expect(err).ToNot(HaveOccurred())
				collectionRef := client.Collection(fr.Collection)
				docs, err := collectionRef.Documents(ctx).GetAll()
				Expect(err).ToNot(HaveOccurred())
				for _, doc := range docs {
					_, err = doc.Ref.Delete(ctx)
				}
				Expect(err).ToNot(HaveOccurred())
			})

			It("should return an error and empty PolicyList ", func() {
				ranges, err := fr.Get(ctx, document)
				Expect(err).To(HaveOccurred())
				Expect(ranges).To(Equal(fs.PolicyList{}))
			})
		})
	})
})
