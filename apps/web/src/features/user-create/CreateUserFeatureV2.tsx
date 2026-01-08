'use client';

import { FormFactory } from '@/shared/ui/FormFactory';
import React from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

const createUserSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  role: z.enum(['admin', 'user', 'manager']),
});

type CreateUserData = z.infer<typeof createUserSchema>;

export function CreateUserFeatureV2() {
  const [isPending, setIsPending] = React.useState(false);

  const handleSubmit = async (data: CreateUserData) => {
    setIsPending(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success('Usuário criado com sucesso!');
    } catch (error) {
      toast.error('Erro ao criar usuário.');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-card rounded-xl border">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Novo Usuário</h2>
        <p className="text-sm text-muted-foreground">Cadastre um novo colaborador na plataforma.</p>
      </div>

      <FormFactory
        schema={createUserSchema}
        onSubmit={handleSubmit}
        isPending={isPending}
        submitLabel="Criar Usuário"
      >
        {(form) => (
          <>
            <FormFactory.Field
              form={form as any}
              name="name"
              label="Nome Completo"
              placeholder="Ex: João da Silva"
            />
            
            <FormFactory.Field
              form={form as any}
              name="email"
              label="E-mail Corporativo"
              placeholder="joao@empresa.com"
              type="email"
            />

            <div className="grid grid-cols-1 gap-4">
              <label className="text-sm font-medium">Perfil de Acesso</label>
              <select 
                {...form.register('role')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Selecione...</option>
                <option value="admin">Administrador</option>
                <option value="manager">Gerente</option>
                <option value="user">Usuário Comum</option>
              </select>
            </div>
          </>
        )}
      </FormFactory>
    </div>
  );
}
