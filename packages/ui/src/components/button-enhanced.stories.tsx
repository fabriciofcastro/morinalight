import type { Meta, StoryObj } from "@storybook/react";
import { ButtonEnhanced } from "./button-enhanced";

const meta: Meta<typeof ButtonEnhanced> = {
  title: "Components/ButtonEnhanced",
  component: ButtonEnhanced,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Botão aprimorado com múltiplas variantes e estados. Suporta loading, disabled e diferentes tamanhos.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "success", "warning", "danger", "info", "secondary", "ghost", "outline"],
      description: "Variante visual do botão",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Tamanho do botão",
    },
    isLoading: {
      control: "boolean",
      description: "Mostra estado de carregamento",
    },
    disabled: {
      control: "boolean",
      description: "Desabilita o botão",
    },
    children: {
      control: "text",
      description: "Conteúdo do botão",
    },
  },
};

export default meta;
type Story = StoryObj<typeof ButtonEnhanced>;

export const Primary: Story = {
  args: {
    variant: "primary",
    children: "Botão Primário",
  },
};

export const Success: Story = {
  args: {
    variant: "success",
    children: "Botão Sucesso",
  },
};

export const Warning: Story = {
  args: {
    variant: "warning",
    children: "Botão Aviso",
  },
};

export const Danger: Story = {
  args: {
    variant: "danger",
    children: "Botão Perigo",
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <ButtonEnhanced size="sm">Pequeno</ButtonEnhanced>
      <ButtonEnhanced size="md">Médio</ButtonEnhanced>
      <ButtonEnhanced size="lg">Grande</ButtonEnhanced>
    </div>
  ),
};

export const Loading: Story = {
  args: {
    variant: "primary",
    isLoading: true,
    children: "Carregando...",
  },
};

export const Disabled: Story = {
  args: {
    variant: "primary",
    disabled: true,
    children: "Desabilitado",
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <ButtonEnhanced variant="primary">Primary</ButtonEnhanced>
      <ButtonEnhanced variant="success">Success</ButtonEnhanced>
      <ButtonEnhanced variant="warning">Warning</ButtonEnhanced>
      <ButtonEnhanced variant="danger">Danger</ButtonEnhanced>
      <ButtonEnhanced variant="info">Info</ButtonEnhanced>
      <ButtonEnhanced variant="secondary">Secondary</ButtonEnhanced>
      <ButtonEnhanced variant="ghost">Ghost</ButtonEnhanced>
      <ButtonEnhanced variant="outline">Outline</ButtonEnhanced>
    </div>
  ),
};

