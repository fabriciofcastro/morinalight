import type { Meta, StoryObj } from '@storybook/react';
import { OrdersReport } from './OrdersReport';

const meta: Meta<typeof OrdersReport> = {
  title: 'Widgets/OrdersReport',
  component: OrdersReport,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof OrdersReport>;

export const Default: Story = {};
