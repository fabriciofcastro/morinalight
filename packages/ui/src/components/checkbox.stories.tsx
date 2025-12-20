import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox } from "./checkbox";
import { FormField } from "./form-field";

const meta: Meta<typeof Checkbox> = {
  title: "Components/Checkbox",
  component: Checkbox,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Caixa de seleção (checkbox) com suporte a acessibilidade e estados.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    disabled: {
      control: "boolean",
      description: "Desabilita o checkbox",
    },
    checked: {
      control: "boolean",
      description: "Estado do checkbox",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  render: (args) => (
    <div className="flex items-center gap-2">
      <Checkbox {...args} id="checkbox-1" />
      <label htmlFor="checkbox-1" className="text-sm text-white/80">
        Aceitar termos e condições
      </label>
    </div>
  ),
};

export const Checked: Story = {
  render: (args) => (
    <div className="flex items-center gap-2">
      <Checkbox {...args} id="checkbox-2" defaultChecked />
      <label htmlFor="checkbox-2" className="text-sm text-white/80">
        Item selecionado
      </label>
    </div>
  ),
};

export const Disabled: Story = {
  render: (args) => (
    <div className="flex items-center gap-2">
      <Checkbox {...args} id="checkbox-3" disabled />
      <label htmlFor="checkbox-3" className="text-sm text-white/60">
        Item desabilitado
      </label>
    </div>
  ),
};

export const DisabledChecked: Story = {
  render: (args) => (
    <div className="flex items-center gap-2">
      <Checkbox {...args} id="checkbox-4" disabled defaultChecked />
      <label htmlFor="checkbox-4" className="text-sm text-white/60">
        Item desabilitado e selecionado
      </label>
    </div>
  ),
};

export const WithFormField: Story = {
  render: (args) => (
    <FormField label="Preferências" hint="Selecione suas preferências">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Checkbox {...args} id="pref-1" />
          <label htmlFor="pref-1" className="text-sm text-white/80">
            Receber notificações por email
          </label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox {...args} id="pref-2" />
          <label htmlFor="pref-2" className="text-sm text-white/80">
            Receber notificações por push
          </label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox {...args} id="pref-3" defaultChecked />
          <label htmlFor="pref-3" className="text-sm text-white/80">
            Compartilhar dados para melhorias
          </label>
        </div>
      </div>
    </FormField>
  ),
};


