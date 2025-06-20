import { FunctionComponent, useEffect, useState } from "react";
import "@ui5/webcomponents-icons/dist/add.js";  
import "@ui5/webcomponents-icons/dist/delete.js";
import "@ui5/webcomponents-icons/dist/action.js";
import { DialogDomRef, ShellBar, Ui5CustomEvent } from "@ui5/webcomponents-react";
import { PolicyList, PolicyTypeFilter, updateData } from "./listSlice";
import PolicyLists from "../components/PolicyLists/PolicyLists";
import CreateDialog from "../components/PolicyCreateDialog/PolicyCreateDialog";
import DeleteDialog from "../components/DeleteDialog/DeleteDialog";
import ViewDialog from "../components/ViewDialog/ViewDialog"; // Import the ViewDialog component
import { createPolicyList, deleteList, fetchData } from "./listSlice";
import { useLocation, useNavigate } from "react-router-dom";
import { update } from "lodash";
import { useSearchParams } from "react-router-dom";

interface HomePageProps {}

const HomePage: FunctionComponent<HomePageProps> = ({}) => {
  const [selectedPolicyList, setSelectedPolicyList] = useState<PolicyList | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreateDeleteDialogOpen, setIsCreateDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false); // Add state for ViewDialog
  const [filterType, setFilterType] = useState<string>('All'); 
  const [selectedIds, setSelectedIds] = useState<string[]>([]); 
  const [policyLists, setPolicyLists] = useState<PolicyList[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const [highlightedRows, setHighlightedRows] = useState<string[]>([]);
  //const [username, setUsername] = useState<string>(""); // Store the username
// const [searchParams] = useSearchParams();
 // const username = searchParams.get("username"); // Extract username from query params

  const handleView = (item: PolicyList) => {
    setSelectedPolicyList(item);
    sessionStorage.setItem('selectedPolicyList', JSON.stringify(item));
    setIsViewDialogOpen(true); // Open the ViewDialog
  };
  useEffect(() => {
    const loadData = async () => {
      try {
        // const token = localStorage.getItem("token");
        // if (!token) {
        //   throw new Error("Token is missing. Redirecting to login.");
        // }
        const username = localStorage.getItem("username");
        if (!username) {
          throw new Error("Username is missing. Redirecting to login.");
        }

        const policies = await fetchData(); // Fetch data without username
        console.log("Fetched Policies:", policies);
        setPolicyLists(policies);
        localStorage.setItem("policyLists", JSON.stringify(policies));

      } catch (error) {
        console.error("Error loading data:", error);
        navigate("/login"); // Redirect to login if fetching data fails
      }
    };

    loadData();
  }, [navigate]);

  const handleCreateList = async (newList: PolicyList) => {
      try {
        const username = localStorage.getItem("username"); // Retrieve the username from localStorage
        if (!username) {
          throw new Error("Username is missing. Cannot create policy list.");
        }
    
        newList.username = username; // Set the username in the new policy
    
        console.log("Creating Policy List with payload:", newList); // Debugging
        console.log("username:", username); // Debugging
        console.log("username:", newList.username); // Debugging


        const response = await createPolicyList(newList);
        console.log("Creating Policy List:", newList);

        if (!response.ok) {
          throw new Error('Error creating list');
        }
        setPolicyLists((prevLists) => [...prevLists, newList]);
   localStorage.setItem("policyLists", JSON.stringify(policyLists));
 //  localStorage.setItem("policyLists", JSON.stringify([...policyLists, newList]));

        handleCloseCreateDialog();

      } catch (error) {
           console.error('Error creating list:', error);
      }
  };


  const handleOpenCreateDialog = () => {
    setIsCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    setIsCreateDialogOpen(false);
  };

  const handleOpenCreateDeleteDialog = () => {
    setIsCreateDeleteDialogOpen(true);
  };

  const handleCloseDialog = (event: Ui5CustomEvent<DialogDomRef, never>) => {
    console.log('Dialog closed:', event);
  };

  const handleDeleteSelected = (selected: PolicyList[]) => {
    //const selectedIdsToDelete = selected.map((policy) => policy.id);
    const selectedIdsToDelete = selected.map((policy) => policy.id).filter((id) => id); // Filter out empty IDs
    console.log("Selected IDs to delete:", selectedIdsToDelete); // Debugging

    setSelectedIds(selectedIdsToDelete);
  };

  const handleDeleteClick = async () => {
    try {
      console.log('Deleting selected policy lists:', selectedIds);
      if (selectedIds.length === 0) {
        console.log("No IDs selected for deletion."); // Debugging
        return;
      }
      console.log("Selected IDs for deletion:", selectedIds); // Debugging

      for (const selectedId of selectedIds) {
        const response = await deleteList(selectedId);

        if (!response.ok) {
          throw new Error(`Failed to delete policy list with ID ${selectedId}`);
        }
      }
      const updatedPolicyLists = policyLists.filter(
        //(policy) => !selectedIds.includes(policy.id)
        (policy) => {
          const username = localStorage.getItem("username"); // Retrieve username from localStorage
          return !selectedIds.includes(policy.id) && policy.username === username; // Filter by username
        }

      );

      console.log("Updated policy lists after deletion:", updatedPolicyLists); // Debugging

      setPolicyLists(updatedPolicyLists);
      setSelectedIds([]);
    } catch (error) {
      console.error('Error deleting policy list:', error);
    }
  };

  useEffect(() => {
    if (location.pathname === '/') {
      navigate('/');
    }
  }, [location.pathname, navigate]);

  const handleTypeChange = (event: any) => {
    const selectedValue = event.detail.selectedOption.dataset.sapUiValue;
    setFilterType(selectedValue);

    if (selectedValue === PolicyTypeFilter.All) {
      navigate('/');
    } else {
      navigate(`/?type=${selectedValue}`);
    }
  };

  const filteredPolicyLists = policyLists.filter((policy) => {
    if (filterType === PolicyTypeFilter.All) {
      return true;
    } else {
      return policy.type?.toLowerCase() === filterType.toLowerCase();
    }
  });

  const handleUpdatePolicyList = async (updatedList: PolicyList) => {
    try {
      setPolicyLists((prevLists) =>
        prevLists.map((list) =>
          list.id === updatedList.id ? updatedList : list
        )
      );
  
      // Highlight the updated row
      setHighlightedRows((prev) => [...prev, updatedList.id]);
  
      // Remove the highlight after 2 seconds
      setTimeout(() => {
        setHighlightedRows((prev) => prev.filter((id) => id !== updatedList.id));
      }, 2000);
  
      const response = await updateData(updatedList.id, updatedList);
  
      if (!response.ok) {
        throw new Error('Failed to update policy list in the database');
      }
    } catch (error) {
      console.error('Error updating policy list:', error);
    }
  };

  const handleCloseViewDialog = () => {
    setIsViewDialogOpen(false); // Close the ViewDialog
  };

  const handleSaveViewDialog = async (editedPolicyList: PolicyList) => {
    try {
      if (!editedPolicyList.id) {
        throw new Error("Policy list ID is missing. Cannot update policy.");
      }

      console.log("Payload being sent to backend:", editedPolicyList); // Debugging

      // Save the edited policy list
      const response = await updateData(editedPolicyList.id, editedPolicyList);

      if (!response.ok) {
        const errorDetails = await response.json();
        console.error("Backend error details:", errorDetails); // Log backend error details
        throw new Error("Failed to update policy list in the database");      
      }
      const updatedList = await response.json(); // Get the updated policy list from the backend

      // setPolicyLists((prevLists) =>
      //   prevLists.map((list) => (list.id === editedPolicyList.id ? editedPolicyList : list))
      // );
      setPolicyLists((prevLists) =>
        prevLists.map((list) =>
          list.id === updatedList.id ? updatedList : list
        )
      );
      handleCloseViewDialog(); // Close the ViewDialog
    } catch (error) {
      console.error('Error updating policy list:', error);
    }
  };
  return (
    <div data-testid="home-page">
      <CreateDialog
        isOpen={isCreateDialogOpen}
        createList={handleCreateList}
        handleClose={handleCloseCreateDialog}
        onClose={handleCloseDialog}
      />

      <DeleteDialog
        isOpen={isCreateDeleteDialogOpen}
        handleClose={() => setIsCreateDeleteDialogOpen(false)}
        onClose={handleCloseDialog}
        onDeleteConfirm={handleDeleteClick}
        selectedPolicyLists={policyLists.filter((policy) =>
          selectedIds.includes(policy.id)
        )}
        selectedIds={selectedIds}
      />

      <PolicyLists
        policyLists={filteredPolicyLists}
        onCreateClick={handleOpenCreateDialog}
        onDeleteSelected={handleDeleteSelected}
        onDeleteConfirmation={handleDeleteClick}
        onView={handleView}
        onUpdatePolicyList={handleUpdatePolicyList}
        filterType={filterType}
        onFilterChange={handleTypeChange}
        onCreateDeleteClick={handleOpenCreateDeleteDialog}
        selectedIds={selectedIds}
        onSelectionChange={(selectedRows) => {
          // Filter out empty IDs before updating the state
          const nonEmptyIds = selectedRows.filter((id) => id !== "");
          setSelectedIds(nonEmptyIds);
        }}
      />

      <ViewDialog
        open={isViewDialogOpen}
        onClose={handleCloseViewDialog}
        policyList={selectedPolicyList}
       // onSave={handleSaveViewDialog}
       onSave={handleUpdatePolicyList} // Pass the update handler here
      />
    </div>
  );
};

export default HomePage;