import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Button } from "./button";
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog";

const meta: Meta<typeof DeleteConfirmationDialog> = {
  title: "Components/DeleteConfirmationDialog",
  component: DeleteConfirmationDialog,
  tags: ["autodocs"],
  argTypes: {
    open: { control: "boolean" },
    isLoading: { control: "boolean" },
    title: { control: "text" },
    description: { control: "text" },
    itemName: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof DeleteConfirmationDialog>;

export const Default: Story = {
  args: {
    open: true,
    title: "Confirmar Exclusão",
    itemName: "Relatório de Vendas Q4",
    isLoading: false,
  },
  render: (args) => {
    const [open, setOpen] = useState(args.open);
    return (
      <div className="p-8 flex justify-center">
        <Button variant="destructive" onClick={() => setOpen(true)}>
          Excluir Relatório
        </Button>
        <DeleteConfirmationDialog 
          {...args} 
          open={open} 
          onClose={() => setOpen(false)} 
          onConfirm={() => {
            console.log("Confirmed deletion");
            setOpen(false);
          }}
        />
      </div>
    );
  },
};

export const Loading: Story = {
  args: {
    open: true,
    title: "Excluindo Registro",
    itemName: "Usuário: John Doe",
    isLoading: true,
  },
  render: (args) => <DeleteConfirmationDialog {...args} />,
};

export const CustomContent: Story = {
  args: {
    open: true,
    title: "Ação Crítica",
    description: "Esta ação apagará todos os backups associados a este servidor. Tem certeza que deseja prosseguir com a purga total?",
    isLoading: false,
  },
  render: (args) => <DeleteConfirmationDialog {...args} />,
};
