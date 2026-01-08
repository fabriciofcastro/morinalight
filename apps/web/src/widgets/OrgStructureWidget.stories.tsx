import type { Meta, StoryObj } from '@storybook/react';
import { OrgStructureWidget } from './OrgStructureWidget';

const meta: Meta<typeof OrgStructureWidget> = {
  title: 'Widgets/OrgStructureWidget',
  component: OrgStructureWidget,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof OrgStructureWidget>;

export const Default: Story = {};
