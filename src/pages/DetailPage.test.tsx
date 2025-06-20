import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';

import { fetchData, updateData } from './listSlice';
import PolicyDetailPage from './DetailPage';


jest.mock('./listSlice');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
});

describe('PolicyDetailPage', () => {
  const mockPolicyList = {
    id: '1',
    name: 'Test Policy',
    ranges: ['192.168.0.1/24'],
    type: 'allow',
    createdAt: '2023-01-01T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSessionStorage.getItem.mockReturnValueOnce(JSON.stringify(mockPolicyList));
  });

  it('renders PolicyDetailPage with fetched data', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockPolicyList,
    });
  
    const {getByText,getByTestId } = render(
      <MemoryRouter initialEntries={['/policy/1']}>
        <Routes>
          <Route path="/policy/:id" element={<PolicyDetailPage />} />
        </Routes>
      </MemoryRouter>
    );
  
    await waitFor(() => {

      expect(getByTestId('input-ip-range-0')).toHaveValue('192.168.0.1/24');
      expect(fetchData).toHaveBeenCalled;
      expect(getByText('allow')).toBeInTheDocument();
      expect(getByTestId('input-name')).toHaveValue('Test Policy');
    });
  });  
  

 it('updates and navigates on save', async () => {
    (updateData as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPolicyList,
    });

    const { getByTestId,getByText} = render(
      <MemoryRouter initialEntries={['/policy/1']}>
        <Routes>
          <Route path="/policy/:id" element={<PolicyDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
        expect(getByTestId('input-name')).toHaveValue('Test Policy');
    });

    fireEvent.change(getByTestId('input-name'), { target: { value: 'Updated Policy' } });

    fireEvent.click(getByText('Save'));

    await waitFor(() => {
      expect(updateData).toHaveBeenCalledWith('1', { ...mockPolicyList, name: 'Updated Policy' });
    });
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
  
  it('navigates on close', async () => {
    const { getByText } = render(
      <MemoryRouter initialEntries={['/policy/1']}>
        <Routes>
          <Route path="/policy/:id" element={<PolicyDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(getByText('Cancel'));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
