import type { Meta, StoryObj } from '@storybook/react';
import { SafeSuspense } from './SafeSuspense';

const meta: Meta<typeof SafeSuspense> = {
  title: 'Shared/UI/SafeSuspense',
  component: SafeSuspense,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SafeSuspense>;

const SlowComponent = () => {
    // This component will trigger suspense if wrapped in React.lazy elsewhere,
    // but here we just simulate delay if it were a real lazy load.
    return <div>Component Loaded!</div>;
};

const ErrorComponent = () => {
    throw new Error("This is a simulated error!");
    return null;
};

export const Loading: Story = {
  render: () => (
    <SafeSuspense>
        <SlowComponent />
    </SafeSuspense>
  ),
};

export const ErrorState: Story = {
  render: () => (
    <SafeSuspense>
        <ErrorComponent />
    </SafeSuspense>
  ),
};
