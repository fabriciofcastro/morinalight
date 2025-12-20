import type { Meta, StoryObj } from "@storybook/react";
import { Textarea } from "./textarea";
import { FormField } from "./form-field";

const meta: Meta<typeof Textarea> = {
  title: "Components/Textarea",
  component: Textarea,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Campo de texto multilinha com suporte a estados de validação e acessibilidade.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    placeholder: {
      control: "text",
      description: "Texto placeholder",
    },
    disabled: {
      control: "boolean",
      description: "Desabilita o textarea",
    },
    validationState: {
      control: "select",
      options: ["default", "valid", "invalid", "pending"],
      description: "Estado de validação",
    },
    rows: {
      control: "number",
      description: "Número de linhas",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  args: {
    placeholder: "Digite seu texto aqui...",
  },
};

export const WithLabel: Story = {
  render: (args) => (
    <FormField label="Descrição" hint="Descreva o produto em detalhes">
      <Textarea {...args} />
    </FormField>
  ),
  args: {
    placeholder: "Digite a descrição...",
  },
};

export const Valid: Story = {
  render: (args) => (
    <FormField label="Comentário" validationState="valid" hint="Texto válido">
      <Textarea {...args} />
    </FormField>
  ),
  args: {
    placeholder: "Digite seu comentário...",
    validationState: "valid",
    defaultValue: "Este é um comentário válido",
  },
};

export const Invalid: Story = {
  render: (args) => (
    <FormField
      label="Comentário"
      validationState="invalid"
      error="O comentário deve ter no mínimo 10 caracteres"
    >
      <Textarea {...args} />
    </FormField>
  ),
  args: {
    placeholder: "Digite seu comentário...",
    validationState: "invalid",
    defaultValue: "Curto",
  },
};

export const Pending: Story = {
  render: (args) => (
    <FormField label="Comentário" validationState="pending" hint="Validando...">
      <Textarea {...args} />
    </FormField>
  ),
  args: {
    placeholder: "Digite seu comentário...",
    validationState: "pending",
    defaultValue: "Aguardando validação",
  },
};

export const Disabled: Story = {
  render: (args) => (
    <FormField label="Comentário" hint="Campo desabilitado">
      <Textarea {...args} />
    </FormField>
  ),
  args: {
    placeholder: "Digite seu comentário...",
    disabled: true,
    defaultValue: "Este campo está desabilitado",
  },
};

export const WithRows: Story = {
  args: {
    placeholder: "Digite um texto longo...",
    rows: 10,
  },
};


