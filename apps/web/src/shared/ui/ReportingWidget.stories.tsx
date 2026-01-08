import type { Meta, StoryObj } from '@storybook/react';
import { ColumnDef } from '@tanstack/react-table';
import { ReportingWidget } from './ReportingWidget';

const meta: Meta<typeof ReportingWidget> = {
  title: 'Shared/UI/ReportingWidget',
  component: ReportingWidget,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ReportingWidget>;

interface ExampleData {
  id: string;
  name: string;
  role: string;
  lastActive: string;
}

const columns: ColumnDef<ExampleData, any>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'role',
    header: 'Role',
  },
  {
    accessorKey: 'lastActive',
    header: 'Last Active',
  },
];

const data: ExampleData[] = [
  { id: '1', name: 'John Doe', role: 'Admin', lastActive: '2 hours ago' },
  { id: '2', name: 'Jane Smith', role: 'Editor', lastActive: '5 mins ago' },
  { id: '3', name: 'Bob Johnson', role: 'Viewer', lastActive: 'Yesterday' },
];

export const Default: Story = {
  args: {
    title: 'User Report',
    description: 'A list of users and their current roles.',
    columns,
    data,
    onExport: () => console.log('Exporting...'),
  },
};
