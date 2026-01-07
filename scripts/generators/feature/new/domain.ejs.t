---
to: src/domain/<%= name %>/<%= name %>.entity.ts
---
export class <%= h.changeCase.pascal(name) %> {
  constructor(
    readonly id: string,
  ) {}
}
