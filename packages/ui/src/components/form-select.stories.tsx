import type { Meta, StoryObj } from "@storybook/react";
import { FormSelect } from "./form-select";

const meta: Meta<typeof FormSelect> = {
  title: "Components/FormSelect",
  component: FormSelect,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Componente de seleção (select) com label, hint, error e estados de validação integrados.",
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
    disabled: {
      control: "boolean",
      description: "Desabilita o select",
    },
  },
};

export default meta;
type Story = StoryObj<typeof FormSelect>;

export const Default: Story = {
  render: () => (
    <FormSelect label="Opção">
      <option value="">Selecione uma opção</option>
      <option value="option1">Opção 1</option>
      <option value="option2">Opção 2</option>
      <option value="option3">Opção 3</option>
    </FormSelect>
  ),
};

export const WithHint: Story = {
  render: () => (
    <FormSelect label="Categoria" hint="Selecione a categoria do produto">
      <option value="">Selecione uma categoria</option>
      <option value="cat1">Categoria 1</option>
      <option value="cat2">Categoria 2</option>
      <option value="cat3">Categoria 3</option>
    </FormSelect>
  ),
};

export const Required: Story = {
  render: () => (
    <FormSelect label="Categoria" required hint="Campo obrigatório">
      <option value="">Selecione uma categoria</option>
      <option value="cat1">Categoria 1</option>
      <option value="cat2">Categoria 2</option>
      <option value="cat3">Categoria 3</option>
    </FormSelect>
  ),
};

export const Valid: Story = {
  render: () => (
    <FormSelect label="Status" validationState="valid" hint="Status válido" defaultValue="opt1">
      <option value="">Selecione um status</option>
      <option value="opt1">Ativo</option>
      <option value="opt2">Inativo</option>
      <option value="opt3">Pendente</option>
    </FormSelect>
  ),
};

export const Invalid: Story = {
  render: () => (
    <FormSelect
      label="Status"
      validationState="invalid"
      error="Por favor, selecione uma opção válida"
    >
      <option value="">Selecione um status</option>
      <option value="opt1">Ativo</option>
      <option value="opt2">Inativo</option>
      <option value="opt3">Pendente</option>
    </FormSelect>
  ),
};

export const Pending: Story = {
  render: () => (
    <FormSelect label="Status" validationState="pending" hint="Validando opção..." defaultValue="opt1">
      <option value="">Selecione um status</option>
      <option value="opt1">Ativo</option>
      <option value="opt2">Inativo</option>
      <option value="opt3">Pendente</option>
    </FormSelect>
  ),
};

export const Disabled: Story = {
  render: () => (
    <FormSelect label="Status" disabled hint="Campo desabilitado" defaultValue="opt1">
      <option value="">Selecione um status</option>
      <option value="opt1">Ativo</option>
      <option value="opt2">Inativo</option>
      <option value="opt3">Pendente</option>
    </FormSelect>
  ),
};

export const ManyOptions: Story = {
  render: () => (
    <FormSelect label="País" hint="Selecione seu país">
      <option value="">Selecione um país</option>
      <option value="br">Brasil</option>
      <option value="us">Estados Unidos</option>
      <option value="uk">Reino Unido</option>
      <option value="ca">Canadá</option>
      <option value="de">Alemanha</option>
      <option value="fr">França</option>
      <option value="es">Espanha</option>
      <option value="it">Itália</option>
      <option value="jp">Japão</option>
      <option value="cn">China</option>
      <option value="au">Austrália</option>
    </FormSelect>
  ),
};


