import type { Meta, StoryObj } from "@storybook/react";
import { AlertTriangle, CheckCircle2, Info as InfoIcon, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./alert";

const meta: Meta<typeof Alert> = {
  title: "Components/Alert",
  component: Alert,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Componente de alerta para exibir mensagens informativas, de sucesso, aviso ou erro.",
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
  render: () => (
    <Alert variant="success">
      <CheckCircle2 />
      <AlertTitle>Sucesso</AlertTitle>
      <AlertDescription>Operação realizada com sucesso!</AlertDescription>
    </Alert>
  ),
};

export const Warning: Story = {
  render: () => (
    <Alert variant="warning">
      <AlertTriangle />
      <AlertTitle>Atenção</AlertTitle>
      <AlertDescription>Este é um aviso importante que requer sua atenção.</AlertDescription>
    </Alert>
  ),
};

export const Error: Story = {
  render: () => (
    <Alert variant="error">
      <XCircle />
      <AlertTitle>Erro</AlertTitle>
      <AlertDescription>
        Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.
      </AlertDescription>
    </Alert>
  ),
};

export const Info: Story = {
  render: () => (
    <Alert variant="default">
      <InfoIcon />
      <AlertTitle>Informação</AlertTitle>
      <AlertDescription>Esta é uma mensagem informativa sobre o sistema.</AlertDescription>
    </Alert>
  ),
};

export const WithoutTitle: Story = {
  render: () => (
    <Alert variant="default">
      <InfoIcon />
      <AlertDescription>Esta é uma mensagem sem título.</AlertDescription>
    </Alert>
  ),
};

export const LongMessage: Story = {
  render: () => (
    <Alert variant="warning">
      <AlertTriangle />
      <AlertTitle>Mensagem Longa</AlertTitle>
      <AlertDescription>
        Esta é uma mensagem de alerta muito longa que contém muitas informações importantes sobre o
        que está acontecendo no sistema. Ela pode ser usada para explicar situações complexas ou
        fornecer detalhes adicionais sobre um aviso ou erro.
      </AlertDescription>
    </Alert>
  ),
};
