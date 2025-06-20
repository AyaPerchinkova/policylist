import { render, fireEvent, screen, waitFor, act } from '@testing-library/react';
import DeleteDialog from './DeleteDialog';
import { PolicyList, PolicyListType } from '../../pages/listSlice';

  
describe('DeleteDialog', () => {
 
  const selectedPolicyLists: PolicyList[] = [
    {
      id: '1', name: 'Policy 1', ranges: ['range1'], type: PolicyListType.Allow, region: 'Region 1', createdAt: '2023-01-01T00:00:00Z', size: 1,
      updatedAt: '',
      username: ''
    },
    {
      id: '2', name: 'Policy 2', ranges: ['range2'], type: PolicyListType.Block, region: 'Region 2', createdAt: '2023-01-01T00:00:00Z', size: 1,
      updatedAt: '',
      username: ''
    },
  ];
  const onDeleteConfirmMock = jest.fn();
  const handleCloseMock = jest.fn();
  const onCloseMock = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders correctly', () => {
      render(
        <DeleteDialog
          isOpen={true}
          handleClose={handleCloseMock}
          onDeleteConfirm={onDeleteConfirmMock}
          selectedPolicyLists={selectedPolicyLists}
          selectedIds={['1', '2']}
          onClose={onCloseMock}
        />
      );
  
      expect(screen.getByTestId('policylist-delete-dialog')).toBeTruthy();
      expect(
        screen.getByText('Are you sure you want to delete the selected policy list?')
      ).toBeTruthy();
  });
  
  it('calls onDeleteConfirm and handleClose on confirm button click', async () => {
    render(
      <DeleteDialog
        isOpen={true}
        handleClose={handleCloseMock}
        onDeleteConfirm={onDeleteConfirmMock}
        selectedPolicyLists={selectedPolicyLists}
        selectedIds={['1']}
        onClose={onCloseMock}
      />
    );
  
    fireEvent.click(screen.getByText('confirm'));
  
    await waitFor(() => {
      expect(screen.queryByText('Policy 1')).toBeNull();
    });
    
    expect(onDeleteConfirmMock).toHaveBeenCalledWith([selectedPolicyLists[0]]);
    expect(handleCloseMock).toHaveBeenCalled();
  });
  
  
  it('calls handleClose on cancel button click', () => {
      render(
        <DeleteDialog
          isOpen={true}
          handleClose={handleCloseMock}
          onDeleteConfirm={onDeleteConfirmMock}
          selectedPolicyLists={selectedPolicyLists}
          selectedIds={['1', '2']}
          onClose={onCloseMock}
        />
      );
  
      fireEvent.click(screen.getByText('cancel'));
  
      expect(handleCloseMock).toHaveBeenCalled();
  });
});
  