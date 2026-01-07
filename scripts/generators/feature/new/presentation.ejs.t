---
to: src/presentation/<%= name %>/<%= name %>-form.tsx
---
'use client'

type Props = {
  onSubmit: () => void
}

export function <%= h.changeCase.pascal(name) %>Form({ onSubmit }: Props) {
  return (
    <form onSubmit={onSubmit}>
      <button type="submit">Salvar</button>
    </form>
  )
}
