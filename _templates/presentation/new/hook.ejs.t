---
to: "<%= withHook ? `apps/web/src/presentation/hooks/use-${h.inflection.dasherize(name).toLowerCase()}.ts` : null %>"
---
import { useState } from 'react';

export function use<%= h.capitalize(name) %>() {
  const [state, setState] = useState(null);

  return {
    state,
    setState
  };
}
