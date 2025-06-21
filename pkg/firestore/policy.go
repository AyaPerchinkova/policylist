package firestore

import (
	"context"
	"fmt"
	"net"
	"time"

	"cloud.google.com/go/firestore"
	"github.tools.aya/aya/decisionCLI/pkg/errors"
	"google.golang.org/api/iterator"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

const policyIDNotProvidedMsg = "policy ID is not provided"

type PolicyRepository struct {
	Client     *firestore.Client
	Collection string
}

func NewPolicyRepository(collection string, client *firestore.Client) (*PolicyRepository, error) {
	if collection == "" {
		return nil, fmt.Errorf("empty collection name")
	}
	return &PolicyRepository{
		Client:     client,
		Collection: collection,
	}, nil
}

func (f *PolicyRepository) Create(ctx context.Context, username string, list PolicyList) (string, error) {
	if list.CreatedAt == nil || list.CreatedAt.IsZero() {
		now := time.Now()
		list.CreatedAt = &now
	}
	now := time.Now()
	list.UpdatedAt = &now
	list.Username = username
	// Debugging logs
	fmt.Printf("Saving Policy: %+v\n", list)

	docRef := f.Client.Collection(f.Collection).NewDoc()
	_, err := docRef.Set(ctx, list)
	if err != nil {
		return "", err
	}
	return docRef.ID, nil
}

// Delete implements decision.PolicyStorage.
func (f *PolicyRepository) Delete(ctx context.Context, docID string) error {
	docRef := f.Client.Collection(f.Collection).Doc(docID)
	_, err := docRef.Delete(ctx)
	if err != nil {
		return err
	}
	return nil
}

func (f *PolicyRepository) GetAll(ctx context.Context, docType string) ([]PolicyList, error) {
	var policyLists []PolicyList

	// Initialize query as a firestore.Query
	query := f.Client.Collection(f.Collection).Query

	// Add filters based on docType and region
	if docType != "" {
		query = query.Where("type", "==", docType)
	}
	// Execute the query
	ipRangesRef := query.Documents(ctx)
	defer ipRangesRef.Stop()

	for {
		doc, err := ipRangesRef.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, fmt.Errorf("failed during iteration over documents: %w", err)
		}

		// Check if __init field is set to true, and skip the document
		if initVal, ok := doc.Data()["__init"]; ok {
			if isInit, ok := initVal.(bool); ok && isInit {
				continue
			}
		}

		var policyList PolicyList
		if err := doc.DataTo(&policyList); err != nil {
			return nil, fmt.Errorf("error deserializing document data: %w", err)
		}
		policyList.ID = doc.Ref.ID
		policyList.Size = len(policyList.Ranges)

		fmt.Printf("Retrieved Policy: %+v\n", policyList)

		policyLists = append(policyLists, policyList)
	}

	return policyLists, nil
}

// Get implements decision.PolicyStorage.
func (f *PolicyRepository) Get(ctx context.Context, docID string) (PolicyList, error) {
	fmt.Printf("Fetching document with ID: %s from collection: %s\n", docID, f.Collection) // Debugging log

	docRef := f.Client.Collection(f.Collection).Doc(docID)
	docSnapshot, err := docRef.Get(ctx)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return PolicyList{}, errors.NewNotFoundError(fmt.Sprintf("document reference with ID %s", docRef.ID))
		}
	}

	var policy PolicyList
	if err := docSnapshot.DataTo(&policy); err != nil {
		return PolicyList{}, err
	}
	policy.ID = docID
	policy.Size = len(policy.Ranges)

	return policy, nil
}

// Update implements decision.PolicyStorage.
func (f *PolicyRepository) Update(ctx context.Context, docID string, policyList PolicyList) error {
	if docID == "" {
		return fmt.Errorf(policyIDNotProvidedMsg)
	}
	now := time.Now()
	policyList.UpdatedAt = &now // Always update UpdatedAt

	docRef := f.Client.Collection(f.Collection).Doc(docID)
	_, err := docRef.Set(ctx, policyList)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return errors.NewNotFoundError(fmt.Sprintf("document reference with ID %s", docRef.ID))
		}
	}

	return nil
}

func (f *PolicyRepository) CheckIP(ctx context.Context, policyID string, ip string) (bool, error) {
	// Fetch the policy document by ID
	doc, err := f.Client.Collection(f.Collection).Doc(policyID).Get(ctx)
	fmt.Printf("doc: %+v\n", doc)
	fmt.Printf("err: %v\n", err)
	fmt.Printf("policyID: %s\n", policyID)
	fmt.Printf("ip: %s\n", ip)
	fmt.Printf("f.Collection: %s\n", f.Collection)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return false, fmt.Errorf("policy not found")
		}
		return false, err
	}

	// Parse the policy data
	var policy PolicyList
	if err := doc.DataTo(&policy); err != nil {
		return false, err
	}

	// Check if the IP matches the policy ranges
	for _, cidr := range policy.Ranges {
		if IsIPInCIDR(ip, cidr) {
			return policy.Type == "allow", nil
		}
	}

	// Default to blocked if no match is found
	return false, nil
}

func (f *PolicyRepository) GetUserPolicyRepo(username string) (*PolicyRepository, error) {
	if username == "" {
		return nil, fmt.Errorf("username is required")
	}

	// Dynamically set the Firestore collection for the user
	collection := fmt.Sprintf("users/%s/policies", username)
	fmt.Printf("Constructed Firestore collection path: %s\n", collection) // Debugging log
	return NewPolicyRepository(collection, f.Client)
}

// isIPInCIDR checks if the given IP address is within the specified CIDR range.
func IsIPInCIDR(ip string, cidr string) bool {
	_, ipNet, err := net.ParseCIDR(cidr)
	if err != nil {
		fmt.Printf("Invalid CIDR: %s\n", cidr)
		return false
	}
	parsedIP := net.ParseIP(ip)
	return ipNet.Contains(parsedIP)
}
