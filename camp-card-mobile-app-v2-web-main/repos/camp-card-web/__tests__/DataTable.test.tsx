/**
 * DataTable Component Tests
 *
 * Tests for the reusable DataTable component including:
 * - Rendering columns and data
 * - Loading state
 * - Empty state
 * - Edit and delete action callbacks
 * - Custom cell rendering
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataTable } from '../components/DataTable';

describe('DataTable Component', () => {
  const mockColumns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
  ];

  const mockData = [
    { id: '1', name: 'John Doe', email: 'john@test.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@test.com' },
    { id: '3', name: 'Bob Wilson', email: 'bob@test.com' },
  ];

  describe('Rendering', () => {
    it('should render column headers', () => {
      render(<DataTable columns={mockColumns} data={mockData} />);

      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
    });

    it('should render data rows', () => {
      render(<DataTable columns={mockColumns} data={mockData} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('jane@test.com')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should render correct number of rows', () => {
      render(<DataTable columns={mockColumns} data={mockData} />);

      // 1 header row + 3 data rows
      const rows = screen.getAllByRole('row');
      expect(rows).toHaveLength(4);
    });

    it('should render correct number of cells per row', () => {
      render(<DataTable columns={mockColumns} data={mockData} />);

      const headerCells = screen.getAllByRole('columnheader');
      expect(headerCells).toHaveLength(3);
    });
  });

  describe('Loading State', () => {
    it('should show loading message when loading is true', () => {
      render(<DataTable columns={mockColumns} data={[]} loading={true} />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should not show data when loading', () => {
      render(<DataTable columns={mockColumns} data={mockData} loading={true} />);

      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('should not show empty message when loading', () => {
      render(<DataTable columns={mockColumns} data={[]} loading={true} />);

      expect(screen.queryByText('No data found')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty message when data is empty', () => {
      render(<DataTable columns={mockColumns} data={[]} />);

      expect(screen.getByText('No data found')).toBeInTheDocument();
    });

    it('should not show column headers in empty state', () => {
      render(<DataTable columns={mockColumns} data={[]} />);

      // Only the empty message should be visible, not the table
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('should render Actions column when onEdit is provided', () => {
      const onEdit = jest.fn();
      render(<DataTable columns={mockColumns} data={mockData} onEdit={onEdit} />);

      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('should render Actions column when onDelete is provided', () => {
      const onDelete = jest.fn();
      render(<DataTable columns={mockColumns} data={mockData} onDelete={onDelete} />);

      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('should not render Actions column when no handlers provided', () => {
      render(<DataTable columns={mockColumns} data={mockData} />);

      expect(screen.queryByText('Actions')).not.toBeInTheDocument();
    });

    it('should call onEdit with row data when edit button clicked', () => {
      const onEdit = jest.fn();
      render(<DataTable columns={mockColumns} data={mockData} onEdit={onEdit} />);

      const editButtons = screen.getAllByRole('button');
      fireEvent.click(editButtons[0]);

      expect(onEdit).toHaveBeenCalledWith(mockData[0]);
    });

    it('should call onDelete with row data when delete button clicked', () => {
      const onDelete = jest.fn();
      render(<DataTable columns={mockColumns} data={mockData} onDelete={onDelete} />);

      const deleteButtons = screen.getAllByRole('button');
      fireEvent.click(deleteButtons[0]);

      expect(onDelete).toHaveBeenCalledWith(mockData[0]);
    });

    it('should render both edit and delete buttons when both handlers provided', () => {
      const onEdit = jest.fn();
      const onDelete = jest.fn();
      render(
        <DataTable columns={mockColumns} data={mockData} onEdit={onEdit} onDelete={onDelete} />
      );

      // 3 rows * 2 buttons = 6 buttons
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(6);
    });
  });

  describe('Custom Cell Rendering', () => {
    it('should use custom render function when provided', () => {
      const columnsWithRender = [
        { key: 'id', label: 'ID' },
        {
          key: 'name',
          label: 'Name',
          render: (value: string) => <span data-testid="custom-name">{value.toUpperCase()}</span>,
        },
      ];

      render(<DataTable columns={columnsWithRender} data={mockData} />);

      const customNames = screen.getAllByTestId('custom-name');
      expect(customNames).toHaveLength(3);
      expect(customNames[0]).toHaveTextContent('JOHN DOE');
    });

    it('should pass full row to render function', () => {
      const renderFn = jest.fn((value, row) => `${value} - ${row.email}`);
      const columnsWithRender = [
        { key: 'name', label: 'Name', render: renderFn },
      ];

      render(<DataTable columns={columnsWithRender} data={mockData} />);

      expect(renderFn).toHaveBeenCalledWith('John Doe', mockData[0]);
    });

    it('should render status badges correctly', () => {
      const columnsWithStatus = [
        { key: 'id', label: 'ID' },
        {
          key: 'status',
          label: 'Status',
          render: (value: string) => (
            <span
              data-testid="status-badge"
              style={{
                backgroundColor: value === 'ACTIVE' ? 'green' : 'red',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
              }}
            >
              {value}
            </span>
          ),
        },
      ];

      const dataWithStatus = [
        { id: '1', status: 'ACTIVE' },
        { id: '2', status: 'INACTIVE' },
      ];

      render(<DataTable columns={columnsWithStatus} data={dataWithStatus} />);

      const badges = screen.getAllByTestId('status-badge');
      expect(badges).toHaveLength(2);
      expect(badges[0]).toHaveTextContent('ACTIVE');
      expect(badges[1]).toHaveTextContent('INACTIVE');
    });
  });

  describe('Row Keys', () => {
    it('should use row id as key when available', () => {
      const { container } = render(<DataTable columns={mockColumns} data={mockData} />);

      // Component should render without key warnings
      expect(container.querySelector('tbody')).toBeInTheDocument();
    });

    it('should fall back to index when id not available', () => {
      const dataWithoutId = [
        { name: 'John', email: 'john@test.com' },
        { name: 'Jane', email: 'jane@test.com' },
      ];

      const { container } = render(<DataTable columns={mockColumns} data={dataWithoutId} />);

      expect(container.querySelector('tbody')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper table structure', () => {
      render(<DataTable columns={mockColumns} data={mockData} />);

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getAllByRole('row')).toHaveLength(4);
      expect(screen.getAllByRole('columnheader')).toHaveLength(3);
      expect(screen.getAllByRole('cell')).toHaveLength(9);
    });

    it('should have accessible buttons', () => {
      const onEdit = jest.fn();
      const onDelete = jest.fn();
      render(
        <DataTable columns={mockColumns} data={mockData} onEdit={onEdit} onDelete={onDelete} />
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toBeEnabled();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined values in data', () => {
      const dataWithUndefined = [
        { id: '1', name: undefined, email: 'john@test.com' },
      ];

      render(<DataTable columns={mockColumns} data={dataWithUndefined} />);

      // Should render without crashing
      expect(screen.getByText('john@test.com')).toBeInTheDocument();
    });

    it('should handle null values in data', () => {
      const dataWithNull = [
        { id: '1', name: null, email: 'john@test.com' },
      ];

      render(<DataTable columns={mockColumns} data={dataWithNull} />);

      expect(screen.getByText('john@test.com')).toBeInTheDocument();
    });

    it('should handle large datasets', () => {
      const largeData = Array.from({ length: 100 }, (_, i) => ({
        id: String(i + 1),
        name: `User ${i + 1}`,
        email: `user${i + 1}@test.com`,
      }));

      render(<DataTable columns={mockColumns} data={largeData} />);

      // Should render all 100 data rows + 1 header row
      expect(screen.getAllByRole('row')).toHaveLength(101);
    });

    it('should handle columns with special characters in keys', () => {
      const specialColumns = [
        { key: 'user.name', label: 'User Name' },
        { key: 'data-value', label: 'Data Value' },
      ];

      const specialData = [
        { 'user.name': 'John', 'data-value': 'Test' },
      ];

      render(<DataTable columns={specialColumns} data={specialData} />);

      expect(screen.getByText('User Name')).toBeInTheDocument();
    });
  });
});

describe('DataTable Styling', () => {
  const mockColumns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
  ];

  const mockData = [{ id: '1', name: 'Test' }];

  it('should have white background', () => {
    const { container } = render(<DataTable columns={mockColumns} data={mockData} />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({ backgroundColor: '#ffffff' });
  });

  it('should have border radius', () => {
    const { container } = render(<DataTable columns={mockColumns} data={mockData} />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({ borderRadius: '12px' });
  });

  it('should have overflow hidden for rounded corners', () => {
    const { container } = render(<DataTable columns={mockColumns} data={mockData} />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({ overflow: 'hidden' });
  });
});
