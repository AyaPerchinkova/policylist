import React from 'react';
import { render, fireEvent, waitFor, screen, act } from '@testing-library/react'; // Import 'act' from '@testing-library/react'
import '@testing-library/jest-dom';
import PolicyLists from './PolicyLists';
import { PolicyListType } from '../../pages/listSlice';
import { ThemeProvider } from '@ui5/webcomponents-react';
import { mockIntersectionObserver } from '../../util/testutil';
import { useNavigate } from 'react-router-dom';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

describe('PolicyLists component', () => {
  const policyLists = [
    {
      username: 'user1',
      id: '1',
      name: 'TestList1',
      ranges: ['10.0.0.0/24'],
      type: PolicyListType.Allow,
      region: 'US-East',
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T12:00:00.000Z',
      size: 1,
    },
    {
      username: 'user2',
      id: '2',
      name: 'TestList2',
      ranges: ['192.168.0.0/24'],
      type: PolicyListType.Block,
      region: 'US-West',
      createdAt: '2023-01-02T00:00:00.000Z',
      updatedAt: '2023-01-02T12:00:00.000Z',
      size: 1,
    },
  ];

  beforeEach(() => {
    mockIntersectionObserver();
  });

  it('renders PolicyLists component with no data', () => {
    render(
      <ThemeProvider>
        <PolicyLists
          policyLists={[]} 
          onCreateClick={jest.fn()}
          onCreateDeleteClick={jest.fn()}
          onView={jest.fn()}
          onDeleteSelected={jest.fn()}
          onDeleteConfirmation={jest.fn()}
          onSelectionChange={jest.fn()}
          filterType="someType"
          onFilterChange={jest.fn()}
        />
      </ThemeProvider>
    );

    expect(screen.getByTestId('policylist-nodata')).toBeInTheDocument();
  });

  it('renders PolicyLists component with data', () => {
    const onCreateClick = jest.fn();
    const onCreateDeleteClick = jest.fn();
    const onDeleteSelected = jest.fn();
    const onDeleteConfirmation = jest.fn();
    const onSelectionChange = jest.fn();
    const onFilterChange = jest.fn();
    const onView = jest.fn();

    render(
      <ThemeProvider>
        <PolicyLists
          policyLists={policyLists}
          onCreateClick={onCreateClick}
          onCreateDeleteClick={onCreateDeleteClick}
          onView={onView}
          onDeleteSelected={jest.fn()}
          onDeleteConfirmation={onDeleteConfirmation}
          onSelectionChange={onSelectionChange}
          filterType="someType"
          onFilterChange={onFilterChange}
        />
      </ThemeProvider>
    );

    expect(screen.getByTestId('policylist-table')).toBeInTheDocument();
    expect(screen.getAllByTestId(/policylist-row-/).length).toBe(policyLists.length);
  });

  it('triggers the create button click', () => {
    const onCreateClick = jest.fn();

    render(
      <ThemeProvider>
        <PolicyLists
          policyLists={policyLists}
          onCreateClick={onCreateClick}
          onCreateDeleteClick={jest.fn()}
          onView={jest.fn()}
          onDeleteSelected={jest.fn()}
          onDeleteConfirmation={jest.fn()}
          onSelectionChange={jest.fn()}
          filterType="someType"
          onFilterChange={jest.fn()}
        />
      </ThemeProvider>
    );

    act(() => {
      fireEvent.click(screen.getByText('Create'));
    });

    expect(onCreateClick).toHaveBeenCalled();
  });

  it('triggers the delete confirmation', async () => {
    const onDeleteSelected = jest.fn();
    const onDeleteConfirmation = jest.fn();
  
    render(
      <ThemeProvider>
        <PolicyLists
          policyLists={policyLists}
          onCreateClick={jest.fn()}
          onCreateDeleteClick={jest.fn()}
          onView={jest.fn()}
          onDeleteSelected={onDeleteSelected}
          onDeleteConfirmation={onDeleteConfirmation}
          onSelectionChange={jest.fn()}
          filterType="someType"
          onFilterChange={jest.fn()}
        />
      </ThemeProvider>
    );
  
    act(() => {
      fireEvent.click(screen.getByText('Delete'));
    });
  
    await act(async () => {
      fireEvent.click(await screen.findByText('Yes'));
    });
    expect(onDeleteConfirmation).toHaveBeenCalled();
  });

  it('triggers the view button click', () => {
    const onView = jest.fn();

    render(
      <ThemeProvider>
        <PolicyLists
          policyLists={policyLists}
          onCreateClick={jest.fn()}
          onCreateDeleteClick={jest.fn()}
          onView={onView}
          onDeleteSelected={jest.fn()}
          onDeleteConfirmation={jest.fn()}
          onSelectionChange={jest.fn()}
          filterType="someType"
          onFilterChange={jest.fn()}
        />
      </ThemeProvider>
    );

    act(() => {
      fireEvent.click(screen.getByText('View'));
    });

    expect(onView).toHaveBeenCalled();
  });

  it('navigates to detail page on row click', () => {
    const navigate = jest.fn();
    (useNavigate as jest.Mock).mockReturnValue(navigate);

    render(
      <ThemeProvider>
        <PolicyLists
          policyLists={policyLists}
          onCreateClick={jest.fn()}
          onCreateDeleteClick={jest.fn()}
          onView={jest.fn()}
          onDeleteSelected={jest.fn()}
          onDeleteConfirmation={jest.fn()}
          onSelectionChange={jest.fn()}
          filterType="someType"
          onFilterChange={jest.fn()}
        />
      </ThemeProvider>
    );

    act(() => {
      fireEvent.click(screen.getByTestId('policylist-row-1'));
    });

    expect(navigate).toHaveBeenCalledWith('/details/1');
  });
});