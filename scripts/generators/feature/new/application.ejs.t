---
to: src/application/<%= name %>/create-<%= name %>.usecase.ts
---
import { <%= h.changeCase.pascal(name) %> } from '@/domain/<%= name %>/<%= name %>.entity'

export class Create<%= h.changeCase.pascal(name) %>UseCase {
  execute(input: { id: string }): <%= h.changeCase.pascal(name) %> {
    return new <%= h.changeCase.pascal(name) %>(input.id)
  }
}
