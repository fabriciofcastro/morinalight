import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./input";
import { FormField } from "./form-field";

const meta: Meta<typeof Input> = {
  title: "Components/Input",
  component: Input,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Campo de entrada de texto com suporte a estados de validação e acessibilidade.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "tel", "url"],
      description: "Tipo de input",
    },
    placeholder: {
      control: "text",
      description: "Texto placeholder",
    },
    disabled: {
      control: "boolean",
      description: "Desabilita o input",
    },
    validationState: {
      control: "select",
      options: ["default", "valid", "invalid", "pending"],
      description: "Estado de validação",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: "Digite algo...",
  },
};

export const WithLabel: Story = {
  render: () => (
    <FormField label="Nome" required>
      <Input placeholder="Digite seu nome" />
    </FormField>
  ),
};

export const Valid: Story = {
  render: () => (
    <FormField label="Email" hint="Email válido" validationState="valid">
      <Input type="email" placeholder="email@exemplo.com" validationState="valid" />
    </FormField>
  ),
};

export const Invalid: Story = {
  render: () => (
    <FormField label="Email" error="Email inválido" validationState="invalid">
      <Input type="email" placeholder="email@exemplo.com" validationState="invalid" />
    </FormField>
  ),
};

export const Pending: Story = {
  render: () => (
    <FormField label="CPF" hint="Validando..." validationState="pending">
      <Input placeholder="000.000.000-00" validationState="pending" />
    </FormField>
  ),
};

export const Disabled: Story = {
  args: {
    placeholder: "Campo desabilitado",
    disabled: true,
  },
};

export const Types: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-80">
      <FormField label="Texto">
        <Input type="text" placeholder="Texto" />
      </FormField>
      <FormField label="Email">
        <Input type="email" placeholder="email@exemplo.com" />
      </FormField>
      <FormField label="Senha">
        <Input type="password" placeholder="••••••••" />
      </FormField>
      <FormField label="Número">
        <Input type="number" placeholder="123" />
      </FormField>
      <FormField label="Telefone">
        <Input type="tel" placeholder="(00) 00000-0000" />
      </FormField>
      <FormField label="URL">
        <Input type="url" placeholder="https://exemplo.com" />
      </FormField>
    </div>
  ),
};

