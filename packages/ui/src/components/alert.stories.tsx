import type { Meta, StoryObj } from "@storybook/react";
import { Alert } from "./alert";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";

const meta: Meta<typeof Alert> = {
  title: "Components/Alert",
  component: Alert,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Componente de alerta para exibir mensagens informativas, de sucesso, aviso ou erro.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "success", "warning", "error", "info"],
      description: "Variante do alerta",
    },
    title: {
      control: "text",
      description: "Título do alerta",
    },
    children: {
      control: "text",
      description: "Conteúdo do alerta",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Default: Story = {
  args: {
    title: "Alerta",
    children: "Esta é uma mensagem de alerta padrão.",
  },
};

export const Success: Story = {
  args: {
    variant: "success",
    title: "Sucesso",
    children: "Operação realizada com sucesso!",
    icon: CheckCircle2,
  },
};

export const Warning: Story = {
  args: {
    variant: "warning",
    title: "Atenção",
    children: "Este é um aviso importante que requer sua atenção.",
    icon: AlertTriangle,
  },
};

export const Error: Story = {
  args: {
    variant: "error",
    title: "Erro",
    children: "Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.",
    icon: XCircle,
  },
};

export const Info: Story = {
  args: {
    variant: "info",
    title: "Informação",
    children: "Esta é uma mensagem informativa sobre o sistema.",
    icon: Info,
  },
};

export const WithoutTitle: Story = {
  args: {
    variant: "info",
    children: "Esta é uma mensagem sem título.",
  },
};

export const LongMessage: Story = {
  args: {
    variant: "warning",
    title: "Mensagem Longa",
    children:
      "Esta é uma mensagem de alerta muito longa que contém muitas informações importantes sobre o que está acontecendo no sistema. Ela pode ser usada para explicar situações complexas ou fornecer detalhes adicionais sobre um aviso ou erro.",
  },
};

