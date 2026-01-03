# 📡 Template de API Client Padronizado

> **Padrão obrigatório para todos os API clients**

---

## 🎯 Estrutura Padrão

```typescript
import { apiClient as api } from "@/lib/api/base";

// Types
export interface [Entity] {
  id: string;
  // ... campos
}

export interface Create[Entity]Input {
  // ... campos (sem id)
}

export interface Update[Entity]Input extends Partial<Create[Entity]Input> {
  id: string;
}

export interface List[Entity]Params {
  orgId?: string;
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  // ... outros filtros
}

export interface List[Entity]Response {
  data: [Entity][];
  total: number;
  page: number;
  limit: number;
}

// API Client
export const [module]Api = {
  /**
   * Lista [entidades] com paginação e filtros
   */
  list: async (params?: List[Entity]Params): Promise<List[Entity]Response> => {
    return api.get<List[Entity]Response>(`/[module]`, { params });
  },

  /**
   * Busca [entidade] por ID
   */
  get: async (id: string): Promise<[Entity]> => {
    return api.get<[Entity]>(`/[module]/${id}`);
  },

  /**
   * Cria nova [entidade]
   */
  create: async (data: Create[Entity]Input & { orgId: string }): Promise<[Entity]> => {
    return api.post<[Entity]>(`/[module]`, data);
  },

  /**
   * Atualiza [entidade] existente
   */
  update: async (data: Update[Entity]Input & { orgId: string }): Promise<[Entity]> => {
    return api.put<[Entity]>(`/[module]/${data.id}`, data);
  },

  /**
   * Deleta [entidade]
   */
  delete: async (id: string): Promise<void> => {
    return api.delete<void>(`/[module]/${id}`);
  },

  // Métodos específicos do módulo (se necessário)
  // [action]: async (params): Promise<ReturnType> => {
  //   return api.[method]<ReturnType>(`/[module]/[action]`, data);
  // },
};
```

---

## 📋 Checklist

- [ ] Types exportados (Entity, CreateInput, UpdateInput, ListParams, ListResponse)
- [ ] Métodos CRUD básicos (list, get, create, update, delete)
- [ ] Documentação JSDoc em cada método
- [ ] Tratamento de erros via interceptor do base.ts
- [ ] Headers de organização automáticos
- [ ] Tipos TypeScript corretos

---

**Última atualização:** 2025-01-19
