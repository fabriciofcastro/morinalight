import type { Meta, StoryObj } from "@storybook/react";
import { GlassCard } from "./glass-card";

const meta: Meta<typeof GlassCard> = {
  title: "Components/GlassCard",
  component: GlassCard,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Card com efeito glassmorphism (vidro fosco) para criar interfaces modernas e elegantes.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    className: {
      control: "text",
      description: "Classes CSS adicionais",
    },
    children: {
      control: "text",
      description: "Conteúdo do card",
    },
  },
};

export default meta;
type Story = StoryObj<typeof GlassCard>;

export const Default: Story = {
  args: {
    children: (
      <div className="p-6">
        <h3 className="mb-2 text-lg font-semibold text-white">Card Padrão</h3>
        <p className="text-white/70">
          Este é um card com efeito glassmorphism padrão. Ele tem um fundo translúcido que cria
          uma sensação de profundidade.
        </p>
      </div>
    ),
  },
};

export const WithTitle: Story = {
  args: {
    children: (
      <div className="p-6">
        <h2 className="mb-4 text-2xl font-bold text-white">Título do Card</h2>
        <p className="mb-4 text-white/80">
          Este card contém um título grande e conteúdo formatado.
        </p>
        <button className="rounded-lg bg-white/10 px-4 py-2 text-white hover:bg-white/20">
          Ação
        </button>
      </div>
    ),
  },
};

export const Compact: Story = {
  args: {
    children: (
      <div className="p-4">
        <h4 className="mb-2 font-semibold text-white">Card Compacto</h4>
        <p className="text-sm text-white/70">Card com padding reduzido.</p>
      </div>
    ),
  },
};

export const WithBorder: Story = {
  args: {
    className: "border border-white/20",
    children: (
      <div className="p-6">
        <h3 className="mb-2 text-lg font-semibold text-white">Card com Borda</h3>
        <p className="text-white/70">Card com borda sutil para maior definição.</p>
      </div>
    ),
  },
};

export const Interactive: Story = {
  args: {
    className: "cursor-pointer transition-all hover:scale-105 hover:bg-white/10",
    children: (
      <div className="p-6">
        <h3 className="mb-2 text-lg font-semibold text-white">Card Interativo</h3>
        <p className="text-white/70">Passe o mouse para ver o efeito de hover.</p>
      </div>
    ),
  },
};

export const Nested: Story = {
  args: {
    children: (
      <div className="p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">Card Aninhado</h3>
        <GlassCard className="bg-white/5">
          <div className="p-4">
            <h4 className="mb-2 font-semibold text-white">Card Interno</h4>
            <p className="text-sm text-white/70">
              Este é um card aninhado dentro de outro card, demonstrando a versatilidade do
              componente.
            </p>
          </div>
        </GlassCard>
      </div>
    ),
  },
};

