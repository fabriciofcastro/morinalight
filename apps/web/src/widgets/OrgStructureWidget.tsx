'use client';

import { TreeItem, TreeView } from '@/shared/ui/TreeView';
import { Button } from '@/shared/ui/base/button';
import { Card } from '@/shared/ui/base/card';
import { Input } from '@/shared/ui/base/input';
import { Building2, Plus, Search, Users } from 'lucide-react';
import React from 'react';

const mockOrgData: TreeItem[] = [
  {
    id: '1',
    label: 'Morina Group',
    icon: Building2,
    metadata: { count: 156 },
    children: [
      {
        id: '1.1',
        label: 'Matriz (São Paulo)',
        metadata: { count: 84 },
        children: [
          { id: '1.1.1', label: 'Departamento Financeiro', metadata: { count: 12 } },
          { id: '1.1.2', label: 'Recursos Humanos', metadata: { count: 8 } },
          { id: '1.1.3', label: 'Engenharia de Software', metadata: { count: 45 } },
          { id: '1.1.4', label: 'Marketing & Vendas', metadata: { count: 19 } },
        ]
      },
      {
        id: '1.2',
        label: 'Filial Nordeste',
        metadata: { count: 42 },
        children: [
          { id: '1.2.1', label: 'Logística', metadata: { count: 30 } },
          { id: '1.2.2', label: 'Atendimento ao Cliente', metadata: { count: 12 } },
        ]
      },
      {
        id: '1.3',
        label: 'Centro de Distribuição (SC)',
        metadata: { count: 30 },
      }
    ]
  }
];

export function OrgStructureWidget() {
  const [selectedUnit, setSelectedUnit] = React.useState<TreeItem | null>(null);

  const handleSelect = (item: TreeItem) => {
    setSelectedUnit(item);
    console.log('Unidade selecionada:', item);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1 p-6 flex flex-col h-[600px]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Estrutura</h2>
          <Button size="icon" variant="ghost">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar unidade..." className="pl-10" />
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <TreeView 
            items={mockOrgData} 
            onSelect={handleSelect} 
            initialExpanded={true}
          />
        </div>
      </Card>

      <Card className="lg:col-span-2 p-6 h-[600px] flex flex-col">
        {selectedUnit ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-primary" />
                  {selectedUnit.label}
                </h2>
                <p className="text-muted-foreground mt-1">
                  Gerencie colaboradores e configurações desta unidade.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">Editar</Button>
                <Button>Adicionar Subunidade</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="p-4 bg-muted/50 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Colaboradores</p>
                <p className="text-2xl font-bold mt-1">{selectedUnit.metadata?.count || 0}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Cargos</p>
                <p className="text-2xl font-bold mt-1">12</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Status</p>
                <p className="text-2xl font-bold mt-1 text-green-500 italic">Ativo</p>
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-xl opacity-60">
              <Users className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Listagem de Colaboradores</p>
              <p className="text-sm text-muted-foreground">Selecione uma ação no topo para gerenciar membros.</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
            <Building2 className="w-16 h-16 mb-4 text-muted-foreground" />
            <h3 className="text-xl font-bold">Selecione uma Unidade</h3>
            <p className="text-muted-foreground max-w-xs mx-auto mt-2">
              Clique em um item na árvore ao lado para visualizar os detalhes organizacionais.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
