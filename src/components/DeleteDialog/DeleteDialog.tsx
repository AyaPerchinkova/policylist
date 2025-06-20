import {
  Dialog,
  Button,
  Bar,
  ButtonDesign,
  Ui5CustomEvent,
  DialogDomRef,
} from '@ui5/webcomponents-react';
import { PolicyList } from '../../pages/listSlice';

interface DeleteDialogProps {
  isOpen: boolean;
  handleClose: () => void;
  onDeleteConfirm: (selectedPolicyList: PolicyList[]) => void;
  
  selectedPolicyLists: PolicyList[];
  selectedIds: string[]; 
  onClose?: ((event: Ui5CustomEvent<DialogDomRef, never>) => void) | undefined;
}

const DeleteDialog: React.FunctionComponent<DeleteDialogProps> = ({
  isOpen,
  handleClose,
  onDeleteConfirm,
  onClose,
  selectedPolicyLists,
  selectedIds,
}) => {

  const handleDeleteConfirm = () => {
  const policiesToDelete = selectedIds.map((selectedId) =>
    selectedPolicyLists.find((policy) => policy.id === selectedId)
  );
  
  onDeleteConfirm(policiesToDelete.filter(Boolean) as PolicyList[]);
    handleClose();
  };
  

  const handleDelete = () => {
    handleClose();
  };

  return (
    <Dialog
      footer={
        <Bar
          endContent={
            <>
              <Button 
                  data-testid="confirm-delete-button" 
                  onClick={handleDeleteConfirm}
                >
                {'confirm'}
              </Button>
              <Button 
                  data-testid="cancel-delete-button" 
                  design={ButtonDesign.Emphasized} 
                  onClick={handleDelete}
                >
              {'cancel'}
              </Button>
            </>
          }
        />
      }
      
      headerText="Delete Policy List"
      open={isOpen}
      onAfterClose={onClose}
      data-testid="policylist-delete-dialog"
    >
      <div style={{ padding: '16px', textAlign: 'center' }}>
        <p>Are you sure you want to delete the selected policy list?</p>
      </div> 
    </Dialog>
    
  );
};

export default DeleteDialog;
