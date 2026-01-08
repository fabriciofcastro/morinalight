import { ColumnDef } from '@tanstack/react-table';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ReportingWidget } from '../ReportingWidget';

interface TestData {
  id: string;
  val: string;
}

const columns: ColumnDef<TestData, any>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'val', header: 'Value' },
];

const data: TestData[] = [
  { id: '1', val: 'Alpha' },
  { id: '2', val: 'Beta' },
];

describe('ReportingWidget', () => {
  it('renders title and data', () => {
    render(<ReportingWidget title="Test Report" columns={columns} data={data} />);
    expect(screen.getByText('Test Report')).toBeDefined();
    expect(screen.getByText('Alpha')).toBeDefined();
    expect(screen.getByText('Beta')).toBeDefined();
  });

  it('filters data based on search input', () => {
    render(<ReportingWidget columns={columns} data={data} />);
    const input = screen.getByPlaceholderText('Pesquisar...');
    fireEvent.change(input, { target: { value: 'Alpha' } });
    
    expect(screen.getByText('Alpha')).toBeDefined();
    expect(screen.queryByText('Beta')).toBeNull();
  });
});
