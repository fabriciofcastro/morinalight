"use client";

import { notificationCenter } from "@/shared/ui/notification-center";
import { useCreateOrder } from "@/presentation/hooks/use-create-order";
import { Button, Input, Label, Modal, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "@morina/ui";
import { useState } from "react";

interface CreateOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateOrderDialog({ open, onOpenChange }: CreateOrderDialogProps) {
  const createOrder = useCreateOrder();
  const [customerId, setCustomerId] = useState(""); // Simplified for demo, would be a select
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  
  // Minimal implementation - in real app would have product selection
  // For Clean Arch demo, we will create an empty order or mock item
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createOrder.mutateAsync({
        customerId: customerId || "guest",
        customerName,
        customerEmail,
        items: [], // Initially empty or requires Product Selection UI logic which is complex for this task
        paymentMethod: "credit_card",
        shippingAddress: {
          street: "Rua Exemplo",
          number: "123",
          neighborhood: "Centro",
          city: "São Paulo",
          state: "SP",
          zipCode: "01000-000",
          country: "Brasil"
        },
        billingAddress: {
          street: "Rua Exemplo",
          number: "123",
          neighborhood: "Centro",
          city: "São Paulo",
          state: "SP",
          zipCode: "01000-000",
          country: "Brasil"
        }
      });
      
      notificationCenter.add({
        type: 'success',
        title: 'Pedido criado',
        message: 'O pedido de venda foi criado com sucesso.'
      });
      
      onOpenChange(false);
    } catch (error: any) {
       notificationCenter.add({
        type: 'error',
        title: 'Erro ao criar pedido',
        message: error.message
      });
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="sm:max-w-[425px]">
        <ModalHeader>
          <ModalTitle>Novo Pedido de Venda</ModalTitle>
        </ModalHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome do Cliente</Label>
            <Input
              id="name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Ex: João Silva"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="cliente@exemplo.com"
              required
            />
          </div>
          <ModalFooter>
             <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
             <Button type="submit" disabled={createOrder.isPending}>
                {createOrder.isPending ? 'Criando...' : 'Criar Pedido'}
             </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
