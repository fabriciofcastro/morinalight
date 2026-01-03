# Como Usar o Sistema Offline

## Integração nas Telas CRUD

Para usar o sistema offline nas suas telas, substitua as chamadas `fetch` diretas pelo `offlineFetch`:

### Antes (sem suporte offline):

```typescript
const response = await fetch(`/api/organizations`, {
  method: "POST",
  headers: {
    ...getAuthHeaders(),
    "Content-Type": "application/json",
  },
  body: JSON.stringify(formData),
});
```

### Depois (com suporte offline):

```typescript
import { offlineApi } from "@/lib/offline-api";

const response = await offlineApi.organizations.create(formData);
const data = await response.json();

if (data.queued) {
  // Operação foi enfileirada para sincronização offline
  console.log("Operação será sincronizada quando a conexão for restabelecida");
}
```

## Recursos Disponíveis

O `offlineApi` já tem helpers para:

- `organizations`: create, update, delete, list
- `users`: create, update, delete, list
- `products`: create, update, delete, list
- `suppliers`: create, update, delete, list

## Exemplo Completo

```typescript
"use client";

import { offlineApi } from "@/lib/offline-api";
import { useOfflineSync } from "@/hooks/use-offline-sync";

export function MyComponent() {
  const { hasPendingOperations, queueStats } = useOfflineSync();

  async function handleCreate() {
    const response = await offlineApi.organizations.create({
      name: "Nova Org",
      description: "Descrição",
    });

    const data = await response.json();

    if (data.queued) {
      alert("Operação enfileirada. Será sincronizada quando online.");
    } else if (response.ok) {
      alert("Organização criada com sucesso!");
    }
  }

  return (
    <div>
      {hasPendingOperations && (
        <p>{queueStats.pending} operações pendentes</p>
      )}
      <button onClick={handleCreate}>Criar</button>
    </div>
  );
}
```

## Status de Conexão

O hook `useConnectionStatus` fornece:

```typescript
const {
  status, // "online" | "offline" | "checking" | "error"
  isOnline, // boolean - conexão de rede
  backendOnline, // boolean - backend responde
  realtimeConnected, // boolean - WebSocket conectado
  lastChecked, // Date | null
  refresh, // função para verificar manualmente
} = useConnectionStatus();
```

## Sincronização Manual

```typescript
import { useOfflineSync } from "@/hooks/use-offline-sync";

function MyComponent() {
  const { sync, isSyncing, progress } = useOfflineSync();

  return (
    <button onClick={sync} disabled={isSyncing}>
      {isSyncing ? `Sincronizando... ${progress?.completed}/${progress?.total}` : "Sincronizar Agora"}
    </button>
  );
}
```
