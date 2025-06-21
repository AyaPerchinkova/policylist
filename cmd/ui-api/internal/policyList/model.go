package decision

import (
	"time"

	"github.tools.aya/aya/decisionCLI/pkg/firestore"
)

type Response struct {
	Name    string `json:"name" binding:"required" example:"PolicyList ID"`
	Message string `json:"response"`
}

type PolicyList struct {
	Username  string     `json:"username"`
	ID        string     `json:"id"`
	Ranges    []string   `json:"ranges"`
	Name      string     `json:"name"`
	Type      string     `json:"type"`
	Region    string     `json:"region"` // Add the region field
	Size      int        `json:"size"`
	CreatedAt *time.Time `json:"createdAt"`
	UpdatedAt *time.Time `json:"updatedAt"`
}

type User struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

/*
Data transformation functions
*/
func toPolicyLists(policyLists []firestore.PolicyList) []PolicyList {
	getPolicyListsResp := make([]PolicyList, len(policyLists))

	for i, pl := range policyLists {
		getPolicyListsResp[i] = toPolicyList(pl)
	}

	return getPolicyListsResp
}

func toPolicyList(policyList firestore.PolicyList) PolicyList {
	return PolicyList{
		Username:  policyList.Username,
		ID:        policyList.ID,
		Ranges:    policyList.Ranges,
		Name:      policyList.Name,
		Type:      policyList.Type,
		Region:    policyList.Region, // Map the region field
		Size:      len(policyList.Ranges),
		CreatedAt: policyList.CreatedAt,
		UpdatedAt: policyList.UpdatedAt,
	}
}

func toRepositoryPolicyList(policyList PolicyList) firestore.PolicyList {
	return firestore.PolicyList{
		Username:  policyList.Username,
		Ranges:    policyList.Ranges,
		Type:      policyList.Type,
		Name:      policyList.Name,
		Region:    policyList.Region, // Map the region field
		CreatedAt: policyList.CreatedAt,
		UpdatedAt: policyList.UpdatedAt,
	}
}
