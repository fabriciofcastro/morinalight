# Acessibilidade - Guia de Implementação

## 📋 Visão Geral

Este documento descreve as práticas de acessibilidade implementadas no projeto MORINA, seguindo WCAG 2.1 AA.

## ♿ Componentes Acessíveis

### ARIA Labels

Todos os componentes interativos devem ter `aria-label` ou `aria-labelledby`:

```typescript
<Button aria-label="Fechar modal">
  <X />
</Button>
```

### Navegação por Teclado

- Todos os elementos interativos devem ser focáveis
- Ordem de tab deve ser lógica
- Atalhos de teclado devem ser documentados

### Foco Visível

- Todos os elementos focáveis devem ter indicador visual de foco
- Usar `:focus-visible` para foco por teclado
- Não remover outline sem alternativa

### Contraste

- Texto normal: mínimo 4.5:1
- Texto grande: mínimo 3:1
- Componentes interativos: mínimo 3:1

### Leitor de Tela

- Usar `role` apropriado
- `aria-describedby` para descrições
- `aria-live` para atualizações dinâmicas
- `aria-expanded` para elementos expansíveis

## 🎯 Checklist de Acessibilidade

### Formulários

- [ ] Labels associados a inputs
- [ ] Mensagens de erro acessíveis
- [ ] Validação em tempo real com feedback
- [ ] Agrupamento lógico de campos

### Navegação

- [ ] Skip links para conteúdo principal
- [ ] Breadcrumbs acessíveis
- [ ] Menu navegável por teclado
- [ ] Indicadores de página atual

### Conteúdo

- [ ] Textos alternativos em imagens
- [ ] Legendas em vídeos (quando aplicável)
- [ ] Estrutura semântica (h1-h6)
- [ ] Listas marcadas corretamente

### Interações

- [ ] Botões com labels descritivos
- [ ] Links com texto descritivo
- [ ] Modais com foco gerenciado
- [ ] Notificações acessíveis

## 🔧 Utilitários

### useAriaLabel

```typescript
const ariaLabel = useAriaLabel({
  action: "Criar",
  resource: "usuário",
});
// "Criar usuário"
```

### useKeyboardNavigation

```typescript
const { onKeyDown } = useKeyboardNavigation({
  onEnter: handleSubmit,
  onEscape: handleCancel,
});
```

## 📝 Notas

- Sempre testar com leitor de tela (NVDA, JAWS, VoiceOver)
- Validar com axe DevTools
- Seguir WCAG 2.1 AA como mínimo
- Considerar usuários com deficiência visual, auditiva, motora e cognitiva
