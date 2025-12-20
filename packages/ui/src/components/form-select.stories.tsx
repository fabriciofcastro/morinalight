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

const options = [
  { value: "", label: "Selecione uma opção" },
  { value: "option1", label: "Opção 1" },
  { value: "option2", label: "Opção 2" },
  { value: "option3", label: "Opção 3" },
];

export const Default: Story = {
  args: {
    label: "Opção",
    options,
  },
};

export const WithHint: Story = {
  args: {
    label: "Categoria",
    hint: "Selecione a categoria do produto",
    options,
  },
};

export const Required: Story = {
  args: {
    label: "Categoria",
    required: true,
    hint: "Campo obrigatório",
    options,
  },
};

export const Valid: Story = {
  args: {
    label: "Status",
    validationState: "valid",
    hint: "Status válido",
    options,
    defaultValue: "option1",
  },
};

export const Invalid: Story = {
  args: {
    label: "Status",
    validationState: "invalid",
    error: "Por favor, selecione uma opção válida",
    options,
  },
};

export const Pending: Story = {
  args: {
    label: "Status",
    validationState: "pending",
    hint: "Validando opção...",
    options,
    defaultValue: "option1",
  },
};

export const Disabled: Story = {
  args: {
    label: "Status",
    disabled: true,
    hint: "Campo desabilitado",
    options,
    defaultValue: "option1",
  },
};

export const ManyOptions: Story = {
  args: {
    label: "País",
    hint: "Selecione seu país",
    options: [
      { value: "", label: "Selecione um país" },
      { value: "br", label: "Brasil" },
      { value: "us", label: "Estados Unidos" },
      { value: "uk", label: "Reino Unido" },
      { value: "ca", label: "Canadá" },
      { value: "de", label: "Alemanha" },
      { value: "fr", label: "França" },
      { value: "es", label: "Espanha" },
      { value: "it", label: "Itália" },
      { value: "jp", label: "Japão" },
      { value: "cn", label: "China" },
      { value: "au", label: "Austrália" },
    ],
  },
};

