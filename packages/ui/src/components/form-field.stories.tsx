import type { Meta, StoryObj } from "@storybook/react";
import { FormField } from "./form-field";
import { Input } from "./input";
import { Textarea } from "./textarea";

const meta: Meta<typeof FormField> = {
  title: "Components/FormField",
  component: FormField,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Wrapper para campos de formulário com label, hint, error e estados de validação.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    label: {
      control: "text",
      description: "Label do campo",
    },
    error: {
      control: "text",
      description: "Mensagem de erro",
    },
    hint: {
      control: "text",
      description: "Dica ou mensagem de ajuda",
    },
    required: {
      control: "boolean",
      description: "Campo obrigatório",
    },
    validationState: {
      control: "select",
      options: ["default", "valid", "invalid", "pending"],
      description: "Estado de validação",
    },
  },
};

export default meta;
type Story = StoryObj<typeof FormField>;

export const Default: Story = {
  render: () => (
    <FormField label="Nome" fieldId="nome">
      <Input id="nome" placeholder="Digite seu nome" />
    </FormField>
  ),
};

export const Required: Story = {
  render: () => (
    <FormField label="Email" required fieldId="email">
      <Input id="email" type="email" placeholder="email@exemplo.com" />
    </FormField>
  ),
};

export const WithHint: Story = {
  render: () => (
    <FormField label="CPF" hint="Digite apenas números" fieldId="cpf">
      <Input id="cpf" placeholder="00000000000" />
    </FormField>
  ),
};

export const WithError: Story = {
  render: () => (
    <FormField label="Email" error="Email inválido" validationState="invalid" fieldId="email-error">
      <Input id="email-error" type="email" placeholder="email@exemplo.com" validationState="invalid" />
    </FormField>
  ),
};

export const Valid: Story = {
  render: () => (
    <FormField label="Email" hint="Email válido" validationState="valid" fieldId="email-valid">
      <Input id="email-valid" type="email" placeholder="email@exemplo.com" validationState="valid" />
    </FormField>
  ),
};

export const Pending: Story = {
  render: () => (
    <FormField label="CPF" hint="Validando..." validationState="pending" fieldId="cpf-pending">
      <Input id="cpf-pending" placeholder="000.000.000-00" validationState="pending" />
    </FormField>
  ),
};

export const WithTextarea: Story = {
  render: () => (
    <FormField label="Descrição" hint="Máximo 500 caracteres" fieldId="descricao">
      <Textarea id="descricao" placeholder="Digite a descrição..." />
    </FormField>
  ),
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-6 w-80">
      <FormField label="Campo Normal" fieldId="normal">
        <Input id="normal" placeholder="Estado normal" />
      </FormField>
      <FormField label="Campo Válido" hint="Validação passou" validationState="valid" fieldId="valid">
        <Input id="valid" placeholder="Estado válido" validationState="valid" />
      </FormField>
      <FormField label="Campo Inválido" error="Erro de validação" validationState="invalid" fieldId="invalid">
        <Input id="invalid" placeholder="Estado inválido" validationState="invalid" />
      </FormField>
      <FormField label="Campo Pendente" hint="Validando..." validationState="pending" fieldId="pending">
        <Input id="pending" placeholder="Estado pendente" validationState="pending" />
      </FormField>
    </div>
  ),
};

