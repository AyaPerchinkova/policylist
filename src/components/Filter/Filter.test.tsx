import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import Filter from './Filter';

describe('Filter', () => {
  const handleTypeChangeMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(
      <Filter
        selectedType="All"
        handleTypeChange={handleTypeChangeMock}
      />
    );

    const filterComponent = screen.getByTestId('filter-component');
    const filterDropdown = screen.getByTestId('filter-dropdown');

    expect(filterComponent).toBeTruthy();
    expect(filterDropdown).toBeTruthy();

    const optionAll = screen.getByTestId('option-all');
    const optionAllow = screen.getByTestId('option-allow');
    const optionBlock = screen.getByTestId('option-block');

    expect(optionAll).toBeTruthy();
    expect(optionAllow).toBeTruthy();
    expect(optionBlock).toBeTruthy();
  });
  
  it('triggers handleTypeChange on dropdown change', () => {
    render(
      <Filter
        selectedType="All"
        handleTypeChange={handleTypeChangeMock}
      />
    );

    const filterDropdown = screen.getByTestId('filter-dropdown');

    fireEvent.change(filterDropdown, { target: { value: 'block' } });

    expect(handleTypeChangeMock).toHaveBeenCalledWith(expect.any(Object));
  });
});