import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TreeItem, TreeView } from '../TreeView';

const mockItems: TreeItem[] = [
  {
    id: '1',
    label: 'Root',
    children: [
      { id: '1.1', label: 'Child' }
    ]
  }
];

describe('TreeView', () => {
  it('renders root items', () => {
    render(<TreeView items={mockItems} />);
    expect(screen.getByText('Root')).toBeDefined();
  });

  it('initially hides children when initialExpanded is false', () => {
    render(<TreeView items={mockItems} initialExpanded={false} />);
    expect(screen.queryByText('Child')).toBeNull();
  });

  it('shows children when root is clicked (toggle)', () => {
    render(<TreeView items={mockItems} initialExpanded={false} />);
    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);
    expect(screen.getByText('Child')).toBeDefined();
  });

  it('calls onSelect when an item is clicked', () => {
    const onSelect = vi.fn();
    render(<TreeView items={mockItems} onSelect={onSelect} />);
    fireEvent.click(screen.getByText('Root'));
    expect(onSelect).toHaveBeenCalledWith(mockItems[0]);
  });
});
