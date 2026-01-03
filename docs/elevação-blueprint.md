Para elevar o blueprint a um nível “cinematográfico” e moderno, sugiro um pacote de refinamentos que combina visual, narrativa e usabilidade — sempre respeitando os tokens Clean Vibrant e a narrativa corporativa do Morina Light:

1. Hero Cinemático e Narrativa Forte
   Trocar o primeiro bloco por uma estrutura em tela dividida: à esquerda headline + ação, à direita um “painel holográfico” com números animados (MFA on, sessões auditadas etc.).
   Usar gradientes translúcidos + “glare” animado (HSLA) sobre o GlassCard principal para reforçar a atmosfera futurista.
   Inserir microcópias para as ações (“Ver blueprint”, “Agendar demo”) com ícones ArrowUpRight ou Sparkle para transmitir movimento.
2. Cards com Profundidade e Linhas do Tempo
   Transformar a grade de marcos em um layout “timeline” com conectores ou linhas 3D: cada item exibe status + percentuais com Progress, um ícone (Lucide) que representa stage.
   Trabalhar com efeito “blur glass” e sombras volumétricas (tokens --shadow-soft/strong) para criar profundidade.
3. Transições e Microinterações
   Introduzir transições “fade-in-up” (Framer Motion ou anim classes) ao entrar na página e ao passar o mouse nos cards (elevação + leve deslocamento).
   Implementar animações de números (“count up”) usando useEffect + requestAnimationFrame para os KPIs (casos de aprovação, variantes em QA).
4. Integração com Documentação Viva
   Adicionar um painel “Doc Status” resumido diretamente no blueprint usando o conteúdo estruturado em docSections (por ex. mostrar quantos docs atualizados, percentuais).
   CTAs explícitos: “Explorar doc hub” e “Ver auditoria live”, aproveitando o novo /docs.
5. Layout Gráfico e Cromia
   Expandir o background com “neon beams” diagonais suaves (radiais/gradientes) que seguem o tema azul/roxo, garantindo contraste com o conteúdo.
   Usar hierarquia tipográfica cuidada: fs-3xl para a headline, fs-xl para subhead, fs-sm para copy — tudo com tracking tight e uppercase bem dosado.
6. Responsividade e Perfis
   Ajustar o blueprint para data-profile="erp": densidade menor, cards mais compactos, barras de progresso menos altos.
   Garantir que os grids façam transição suave para 1 coluna em mobile com spacing controlado pelos tokens --space-\*.
7. Narrativa Visual
   Inserir uma seção “Linha do tempo de entregas” com chips datados (ex: “Fev/25 – Tema Clean Vibrant completo”, “Mar/25 – Docs hub live”), reutilizando dataset do docChangelog.
   Fechar com CTA repetido + “Fale com a operação” (link mail/meeting) para reforçar conversão.
   Com essas sugestões, o blueprint ganha dinamismo e reforça a mensagem de que tecnologia, governança e design estão integrados. Posso partir para a implementação incremental (hero + cards + animações) se quiser seguir essa linha.

Blueprint Vivo: proposta de evolução
Ícones com personalidade
Criar uma camada de ícones animados usando lottie-react com assets em SVG/Lottie otimizados (ex.: “escudo pulsante”, “radar de compliance”, “painel de métricas”).
Configurar uma pequena coleção (/apps/web/src/assets/lottie/blueprint/\*.json) com animações em loop suave, sincronizadas com prefers-reduced-motion.
Expor um wrapper AnimatedGlyph que aceita intensity e theme para trocar cores via hsl(var(--accent)).
Formas e partículas dinâmicas
Adicionar um canvas/glsl leve (react-three-fiber ou react-particles) no background do hero, com partículas que respondem ao movimento do mouse e ao tema atual.
Alternativa mais leve: SVGs animados com motion.path (Framer Motion) para criar “orbes” orbitando os cards.
Interações coreografadas
Em cada card-chave, colocar um ícone animado que reage ao hover (ex.: brilho aumenta, orbitas aceleram).
Integrar eventos (por ex. onVisible via IntersectionObserver) para disparar animações quando o usuário rolar, criando uma sensação de narrativa.
Componentização e reuso
Criar BlueprintAnimatedIcon.tsx dentro de components/blueprint/ que centraliza: carregamento Lottie, fallback estático, controles de velocidade/loop, e herda tokens (cores, sombras).
Usar GlassLayer com gradientes animados (background-size e keyframes suaves) para dar vida às superfícies.
Próximos passos sugeridos (em pequenos blocos)
Infra de animação: instalar lottie-react (ou confirmar se já está no monorepo), criar wrapper e assets base.
Hero: substituir ícone estático por AnimatedGlyph, incluir partículas/gradiente animado em background.
Cards: aplicar animações de entrada + ícones vivos nos cards principais e timeline.
Ajustes responsivos/A11y: garantir fallback estático, desligar animações em prefers-reduced-motion.
Tests & QA: snapshot visual, validação manual em /docs e /settings/company.
Posso começar implementando a camada de ícones animados (passo 1) e evoluir a partir daí. Confirma que seguimos esse plano?

---

## Evolução do blueprint

Diagnóstico rápido
Tipografia & hierarquia: tamanhos/espacamentos pouco contrastantes; falta ritmo vertical e cabeçalho que oriente a leitura.
Layout & navegação: hero ocupa tudo, mas não guia o usuário; cards empilhados tornam a leitura cansativa; ausência de header/footer dificulta localizar ações globais.
Tema/glow inconsistente: degradê inicial (SSR) difere do aplicado após useThemeEngine, causando “flash” esverdeado/roxo.
Personalização insuficiente: data-profile existe, porém não há controle no painel; empresas não conseguem ajustar densidade/tons do blueprint.
Proposta de redesenho (alta prioridade)
Cabeçalho fixo e navegação
Barra superior com logo, seleção de “Perfis” (Operações, Produto, Auditoria) e CTA “Solicitar demo”.
Links âncora: #overview, #status, #timeline, #doc-hub.
Hero em dois blocos
Lado esquerdo: headline com tipografia 3XL/XL, subtítulo ≤ 48ch, botões primário/secundário.
Lado direito: painel holográfico com Lottie (variação por perfil) + contadores animados e microcópias legíveis.
Seção “Pilotos do Blueprint”
Cards em grid 3x1 com ícones, copy curta e CTA micro (arrow). Usar BlueprintReveal com delays.
“Status operacional” segmentado
Card principal com gráfico de progresso (radial ou stacked bar).
Coluna lateral com “Doc Status” reorganizada em tabela/resumo + CTA para /docs.
Linha do tempo horizontal
Chips com data + tag; responsivo vira carrossel scroll-snap.
CTA “Falar com operações” persistente.
Rodapé informativo
Links rápidos (/docs, /settings/company, /catalogo/auditoria).
Contatos, uptime e link para openapi.
Ajustes visuais e técnicos
Tipografia: definir escala (3XL/XL/LG/SM) com letter-spacing e line-height coerentes; aplicar font-variation-settings p/ títulos.
Espaçamento: usar novo token --section-gap e grid com minmax(0, 1fr) + max-w-7xl.
Fundo/gradientes: gerar gradient idempotente (mesmas cores SSR/client) via token único (--bg-gradient-static) aplicado antes do hook.
Gestão de cores: criar “paleta blueprint” (--blueprint-primary, --blueprint-accent) aplicada ao Hero/backdrop para evitar mudança abrupta.
Animações: transições suaves com prefers-reduced-motion e delay incremental.
Painel de personalização (entrega paralela)
Adicionar na PersonalizationPanel um bloco “Experiência do Blueprint”:
Seleção de perfil (web, erp, board) → ajusta densidade/tipografia.
Paleta de destaque (3 presets) para gradientes específicos da home.
Toggle “Mostra animações avançadas” (ativa Lottie/canvas).
Persistir em CompanySettings (blueprintProfile, blueprintPalette, blueprintAnimations).
Hook useThemeEngine aplica tokens específicos no SSR (antes da primeira renderização).
Próximos passos (execução sugerida)
Esboçar estrutura JSX nova com header/hero/footer, mantendo Clean Vibrant.
Criar tokens extras (--blueprint-\*) e garantir gradiente único no SSR.
Integrar BlueprintReveal aos novos blocos, ajustar tipografia/spacing.
Estender painel de personalização + hook/rota /api/company-settings.
Ajustar testes (page.spec.tsx) e snapshots, adicionar cenários de perfis.
Revisar acessibilidade (landmarks, headings, navegação por teclado).
Posso começar implementando o cabeçalho + hero + ajuste de gradiente (passo 1/2) ainda hoje e evoluir se aprovar este plano.

---

## Status de implementação · 11/01/2025

### ✅ Concluído recentemente

#### Auditoria e Realtime

- **Auditoria organizacional em realtime**: Implementada publicação automática de eventos de auditoria organizacional no stream Redis `realtime.notifications`. Todos os registros de auditoria (convites, membros, roles) são publicados automaticamente para notificações em tempo real.
- **Auditoria de login**: Implementado registro completo de tentativas de login:
  - `auth.login.sucesso`: Registrado quando login é bem-sucedido (com orgId ou "system" se não houver organização)
  - `auth.login.tentativa_falha`: Registrado para falhas (usuário não encontrado, senha inválida, usuário inativo)
  - Payload inclui email, displayName e reason (quando aplicável)
- **Integração com event bus**: Repositórios de auditoria (in-memory e Prisma) agora recebem `eventBus` opcional e publicam eventos automaticamente no stream realtime.

#### Tela de Login

- **Redesign completo**: Nova tela de login seguindo design system moderno:
  - Layout limpo e minimalista, alinhado com a página de invite
  - Uso correto dos tokens CSS do design system
  - GlassCard com efeitos visuais e gradientes
  - Formulário simplificado (removido campo OTP opcional)
  - Integração completa com API de login via BFF
  - Feedback visual de sucesso/erro
  - Redirecionamento automático após login bem-sucedido
- **BFF de login**: Criado endpoint `/api/auth/login` que faz proxy para a API Fastify com tratamento adequado de erros.

## Status de implementação · 10/11/2025

### Concluído

- **Fundação multi-tenant**: novas tabelas `Organization`, `OrganizationMembership`, `User`, `UserInvite` no Prisma; `Product` e `CompanySettings` associados à organização; cliente Prisma regenerado.
- **Módulo Organizations API**: rota `GET /organizations` retorna lista contextualizada por usuário (`x-user-id`), com repositórios Prisma e in-memory e cobertura de testes vitest.
- **Observabilidade atualizada**: pipeline CI roda lint/test/API/web/realtime; docs OpenAPI/Postman publicados; script `pnpm demo:catalogo` para validar jornadas.
- **Autenticação JWT**: rotas `POST /auth/register` e `POST /auth/login` com hashing `bcrypt`, suporte a convites (`UserInvite`), criação automática de organização + membership owner e token JWT com `defaultOrgId`.
- **Convites multi-org**: rotas `POST /organizations/:orgId/invites`, `GET /organizations/:orgId/invites` e `DELETE /organizations/:orgId/invites/:inviteId` com checagem de papéis (owner/admin/manager), prevenção de duplicidade, cancelamento e testes de integração.

- **Gestão de membros & convites**: API + painéis `/settings/team` e convites sociais prontos (criação/cancelamento, papéis, salvaguardas) e onboarding público via `/invite/[token]`; próximo passo é registrar auditoria de papéis e integrar notificações.
- **UI de equipe**: telas Next para login, aceitação de convite, administração da equipe; integração com `/notifications/feed`.
- **Seeds/migrations reais**: aplicar `prisma migrate` + seeds com organizações e usuários demo para garantir ambientes identicamente configurados.

### Próximas entregas blueprint

1. **Header + hero refinados** (com gradiente consistente SSR/client) → alinhar narrativa cinematográfica.
2. **Painel “Doc Status” integrado** consumindo `/docs` e `/notifications/feed`.
3. **Linha do tempo viva** alimentada pelos changelogs (catálogo, realtime, organizações).
4. **Painel de personalização** extendido (`blueprintProfile`, `blueprintAnimations`) persistido em Company Settings.

> Todos os incrementos acima já mapeados em épicos `epic-1-org`, `epic-1-users-*`, garantindo que a evolução visual acompanhe a fundação técnica do sistema.
> Proposta de Tratamento por Sessões
> Estrutura base (layout tokens)
> Definir Section com espaçamento vertical (--section-padding-y) e horizontal (--container-max, --container-padding).
> Criar utilitários Stack (coluna), Cluster (layout horizontal com espaçamento), Switch (grid responsivo).
> Configurar --section-gap (ex. 80px web, 64px mobile).
> Hero / Header
> Fundo próprio (gradiente linear + textura “noise” leve).
> Conteúdo em duas colunas; remover borda, trabalhar layering com glass translúcido atrás do call-to-action.
> Cards/Pilares
> Usar grid 3x1, cada card com cor variante (--section-bg-1/2/3) e leve sombra interna.
> Arredondamento uniforme (--r-lg), sem borda; separar pelo espaço do grid.
> Status Operacional
> Seção com fundo escuro (variação tonal) ocupando largura total, texto claro.
> Sub-blocos (ex.: gráfico, paineis) em semi-transparência/blend-mode. Sem borda; usar degrade vertical para “piscar” transição.
> Knowledge Hub
> Fundo claro neutro.
> Conteúdo dentro de container flex com cards coloridos; separar com border-top no container principal (estilizado com linear gradient curto) ou com clip-path.
> Timeline
> Fundo degradê suave (horizontal), chips com outline interno, sem sym border.
> Layout horizontal com scroll-snap; background com linhas diagonais (SVG repetido) para dar profundidade.
> Rodapé
> Fundo sólido diferente (ex.: tom de superfície + variação azul escuro), tipografia branca/cinza claro.
> Links distribuídos com Stack/Cluster.
> Implementação
> Criar arquivo layout-tokens.css (ou ampliar globals.css) com variáveis:
> --section-bg-default, --section-bg-alt, --section-bg-inverse
> --section-shadow-soft, --section-shadow-deep
> Criar componente Section (tsx) que recebe variant (default, accent, inverse, etc.) e aplica classes (background, color, padding).
> Reaplicar layout do page.tsx usando Section com variantes, sem bordas.
> Ajustar BlueprintReveal para respeitar o padding interno (evitar overflow).
> Revisar tipografia espaçamentos aplicando Stack para cada bloco.
> Próximos passos
> Se você aprovar essa linha, começo implementando:
> Tokens/layout utilitários.
> Componente Section.
> Reescrever hero/pilares/status/timeline com esses recursos.
> Ajustar doc hub/timeline.
> Atualizar CSS / testes.
