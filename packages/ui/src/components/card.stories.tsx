import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";

const meta: Meta<typeof Card> = {
  title: "Components/Card",
  component: Card,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["elevated", "outlined", "filled"],
    },
    clickable: {
      control: "boolean",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Versatile Card component with 3 variants and composable parts (Header, Content, Footer). Most used component in dashboards.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-text-secondary">
          This is the card content. You can put any content here.
        </p>
      </CardContent>
      <CardFooter>
        <Button>Action</Button>
      </CardFooter>
    </Card>
  ),
};

export const Elevated: Story = {
  render: () => (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle>Elevated Card</CardTitle>
        <CardDescription>With shadow and border</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-text-secondary">The elevated variant has a shadow and subtle border.</p>
      </CardContent>
    </Card>
  ),
};

export const Outlined: Story = {
  render: () => (
    <Card variant="outlined">
      <CardHeader>
        <CardTitle>Outlined Card</CardTitle>
        <CardDescription>With visible border</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-text-secondary">The outlined variant has a prominent border.</p>
      </CardContent>
    </Card>
  ),
};

export const Filled: Story = {
  render: () => (
    <Card variant="filled">
      <CardHeader>
        <CardTitle>Filled Card</CardTitle>
        <CardDescription>With background color</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-text-secondary">The filled variant has a colored background.</p>
      </CardContent>
    </Card>
  ),
};

export const Clickable: Story = {
  render: () => (
    <Card clickable onClick={() => alert("Card clicked!")}>
      <CardHeader>
        <CardTitle>Clickable Card</CardTitle>
        <CardDescription>Click me!</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-text-secondary">This card has hover effects and is clickable.</p>
      </CardContent>
    </Card>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4">
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Elevated</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-text-secondary">Shadow + border</p>
        </CardContent>
      </Card>
      <Card variant="outlined">
        <CardHeader>
          <CardTitle>Outlined</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-text-secondary">Prominent border</p>
        </CardContent>
      </Card>
      <Card variant="filled">
        <CardHeader>
          <CardTitle>Filled</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-text-secondary">Colored background</p>
        </CardContent>
      </Card>
    </div>
  ),
};
