import type { Meta, StoryObj } from "@storybook/react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover";
import { Button } from "./button";
import { Input } from "./input";

const meta: Meta<typeof Popover> = {
  title: "Components/Popover",
  component: Popover,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Componente de popover (caixa flutuante) acessível usando Radix UI.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Popover>;

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button>Abrir Popover</Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="space-y-2">
          <h4 className="font-medium text-white">Popover</h4>
          <p className="text-sm text-white/70">Este é o conteúdo do popover.</p>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const WithForm: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Abrir Formulário</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h4 className="font-medium text-white">Configurações</h4>
          <div className="space-y-2">
            <label className="text-sm text-white/80">Nome</label>
            <Input placeholder="Digite seu nome" />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-white/80">Email</label>
            <Input type="email" placeholder="Digite seu email" />
          </div>
          <Button className="w-full">Salvar</Button>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const WithList: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Ver Opções</Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="space-y-2">
          <h4 className="font-medium text-white">Opções</h4>
          <div className="space-y-1">
            <button className="block w-full rounded px-2 py-1 text-left text-sm text-white/80 hover:bg-white/10">
              Opção 1
            </button>
            <button className="block w-full rounded px-2 py-1 text-left text-sm text-white/80 hover:bg-white/10">
              Opção 2
            </button>
            <button className="block w-full rounded px-2 py-1 text-left text-sm text-white/80 hover:bg-white/10">
              Opção 3
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};



