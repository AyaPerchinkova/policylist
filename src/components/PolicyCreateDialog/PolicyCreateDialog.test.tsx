import { render, fireEvent, screen, act, waitFor } from '@testing-library/react';
import CreateDialog from './PolicyCreateDialog';
import { PolicyListType } from '../../pages/listSlice';
import { ThemeProvider } from '@ui5/webcomponents-react';

describe('CreateDialog', () => {
  const createListMock = jest.fn();
  const handleCloseMock = jest.fn();
  const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

  beforeEach(() => {
    jest.clearAllMocks();
  });
  afterAll(() => {
    alertSpy.mockRestore();
  });


  it('renders correctly', () => {
    render(
      <ThemeProvider>
        <CreateDialog 
               isOpen={true} 
               createList={createListMock} 
               handleClose={handleCloseMock} 
         />
      </ThemeProvider>
    );

    expect(screen.getByTestId('policylist-create-dialog')).toBeTruthy();
    expect(screen.getByTestId('input-name')).toBeTruthy();
    expect(screen.getByTestId('input-ip-range-0')).toBeTruthy();
    expect(screen.getByTestId('select-type')).toBeTruthy();
  });

  
  it('triggers createList and handleClose on create button click', async () => {
    render(
      <ThemeProvider>
        <CreateDialog 
              isOpen={true} 
              createList={createListMock} 
              handleClose={handleCloseMock} 
         />
      </ThemeProvider>
    );
  
    // Simulate user input
    await fireEvent.change(screen.getByTestId('input-name'), { target: { value: 'TestList' } });
    await fireEvent.change(screen.getByTestId('input-ip-range-0'), { target: { value: '192.168.0.1/24' } });
  
    await act(async () => {
      await fireEvent.click(screen.getByText('create'));
    });

    expect(createListMock).toHaveBeenCalled();
    expect(createListMock.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        name: 'TestList',
        ranges: ['192.168.0.1/24'],
        type: PolicyListType.Allow,
      })
    );
    });

  it('calls handleClose when close button is pressed', () => {
    render(
      <ThemeProvider>
        <CreateDialog  
             isOpen={true} 
             createList={createListMock} 
             handleClose={handleCloseMock} 
        />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByText('close'));
    expect(handleCloseMock).toHaveBeenCalled();
  });
  
  
  it('shows an error for invalid IP range on create button click', async () => {
    render(
      <ThemeProvider>
        <CreateDialog isOpen={true} createList={createListMock} handleClose={handleCloseMock} />
      </ThemeProvider>
    );

    fireEvent.change(screen.getByTestId('input-name'), { target: { value: 'TestList' } });
    fireEvent.change(screen.getByTestId('input-ip-range-0'), { target: { value: 'invalid-ip' } });
    fireEvent.click(screen.getByText('create'));

    await waitFor(() => {
      expect(createListMock).not.toHaveBeenCalled();
      expect(handleCloseMock).not.toHaveBeenCalled();
      expect(screen.getByText('Invalid IP range. Please enter a valid CIDR format.')).toBeTruthy();
    });
  });

  it('shows an error for missing name on create button click', async () => {
    render(
      <ThemeProvider>
        <CreateDialog 
             isOpen={true} 
             createList={createListMock} 
             handleClose={handleCloseMock} 
         />
      </ThemeProvider>
    );

    await act(async () => {
      fireEvent.change(screen.getByTestId('input-name'), { target: { value: '' } });
      fireEvent.click(screen.getByText('create'));
    });

    expect(createListMock).not.toHaveBeenCalled();
    expect(handleCloseMock).not.toHaveBeenCalled();
    expect(screen.getByText('Please enter a name.')).toBeTruthy();
  });
});
