import type { Meta, StoryObj } from '@storybook/react';
import { Building2, Users } from 'lucide-react';
import { TreeItem, TreeView } from './TreeView';

const meta: Meta<typeof TreeView> = {
  title: 'Shared/UI/TreeView',
  component: TreeView,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TreeView>;

const mockItems: TreeItem[] = [
  {
    id: '1',
    label: 'Morina Group',
    icon: Building2,
    metadata: { count: 156 },
    children: [
      {
        id: '1.1',
        label: 'Matriz (São Paulo)',
        metadata: { count: 84 },
        icon: Building2,
        children: [
          { id: '1.1.1', label: 'Departamento Financeiro', metadata: { count: 12 }, icon: briefcase },
          { id: '1.1.2', label: 'Recursos Humanos', metadata: { count: 8 }, icon: Users },
          { id: '1.1.3', label: 'Engenharia de Software', metadata: { count: 45 }, icon: Users },
        ]
      },
      {
        id: '1.2',
        label: 'Filial Nordeste',
        metadata: { count: 42 },
        icon: Building2,
        children: [
          { id: '1.2.1', label: 'Logística', metadata: { count: 30 } },
          { id: '1.2.2', label: 'Atendimento ao Cliente', metadata: { count: 12 } },
        ]
      }
    ]
  }
];

export const Default: Story = {
  args: {
    items: mockItems,
    initialExpanded: true,
  },
};

export const Collapsed: Story = {
  args: {
    items: mockItems,
    initialExpanded: false,
  },
};
