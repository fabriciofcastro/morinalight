import type { Meta, StoryObj } from "@storybook/react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";
import { Button } from "./button";

const meta: Meta<typeof Tooltip> = {
  title: "Components/Tooltip",
  component: Tooltip,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Componente de tooltip (dica de contexto) acessível usando Radix UI.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    delayDuration: {
      control: "number",
      description: "Delay antes de mostrar o tooltip (ms)",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button>Hover me</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Esta é uma dica de contexto</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};

export const WithText: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Informação</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Clique para ver mais detalhes sobre este item</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};

export const OnIcon: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="rounded-full p-2 hover:bg-white/10">
            <span className="text-white">ⓘ</span>
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Informação adicional</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};

export const LongText: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Hover para mais informações</Button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p>
            Este é um tooltip com texto longo que pode conter informações detalhadas sobre o
            elemento sobre o qual você está passando o mouse.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};









