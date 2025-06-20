import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ViewDialog from './ViewDialog';
import { PolicyListType } from '../../pages/listSlice';
import { useNavigate } from 'react-router-dom';
import { size } from 'lodash';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

const policyListMock = {
  username: 'testuser',
  id: '1',
  name: 'TestList',
  ranges: ['10.0.0.0/24'],
  type: PolicyListType.Allow,
  createdAt: '2023-01-01T00:00:00.000Z',
  region: 'us-east-1',
  size: 1,
  updatedAt: '2023-01-02T00:00:00.000Z',
};

const onCloseMock = jest.fn();
const onSaveMock = jest.fn();

describe('ViewDialog', () => {
  it('renders correctly with policy list', () => {
    render(
      <ViewDialog 
         open={true} 
         onClose={onCloseMock} 
         onSave={onSaveMock} 
         policyList={policyListMock} />
    );

    expect(screen.getByTestId('input-name')).toBeInTheDocument();
    expect(screen.getByTestId('input-ip-range-0')).toBeInTheDocument();
    expect(screen.getByTestId('select-type')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('triggers onSave handler when "Save" button is clicked with valid data', () => {
    const mockNavigate = jest.fn();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    render(
      <ViewDialog 
           open={true} 
           onClose={onCloseMock} 
           onSave={onSaveMock} 
           policyList={policyListMock} />
    );

    fireEvent.click(screen.getByText('Save'));

    expect(onSaveMock).toHaveBeenCalled();

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('allows adding and removing IP ranges', async () => {
    render(
      <ViewDialog 
           open={true} 
           onClose={onCloseMock} 
           onSave={onSaveMock} 
           policyList={policyListMock} />
    );

    await fireEvent.click(screen.getByTestId('add-button'));

    expect(screen.getAllByTestId(/^input-ip-range-/)).toHaveLength(2);

    await fireEvent.click((screen.getByTestId('input-ip-range-0').nextSibling as Element));

    expect(screen.getAllByTestId(/^input-ip-range-/)).toHaveLength(1);
  });


  it('allows changing input values', async () => {
    render(
      <ViewDialog 
           open={true} 
           onClose={onCloseMock} 
           onSave={onSaveMock} 
           policyList={policyListMock} />
    );

    await fireEvent.change(screen.getByTestId('input-name'), { target: { value: 'New Policy List Name' } });
    await fireEvent.change(screen.getByTestId('input-ip-range-0'), { target: { value: '192.168.0.1/16' } });

    expect(screen.getByTestId('input-name')).toHaveValue('New Policy List Name');
    expect(screen.getByTestId('input-ip-range-0')).toHaveValue('192.168.0.1/16');
  });

  it('handles "Cancel" button click', () => {
    render(
      <ViewDialog 
            open={true} 
            onClose={onCloseMock} 
            onSave={onSaveMock} 
            policyList={policyListMock} />
    );

    fireEvent.click(screen.getByText('Cancel'));

    expect(onCloseMock).toHaveBeenCalled();
  });
});
