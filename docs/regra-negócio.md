# Regras de Negócio - Comissão Representante

**Responsáveis:** Fabrício e Michel

Este documento define as regras de negócio para o cálculo, lançamento e pagamento de comissões de representantes, visando garantir a integridade financeira, conformidade e rastreabilidade do processo.

---

## 1. Regra de Negócio: Comissão Representante

### Princípio Fundamental
**Boleta não lançada no mês NÃO é paga no mês seguinte.**

### RN-CICLO-01: Competência Mensal
Boletas pertencem estritamente ao ciclo financeiro do mês vigente.
- Se a venda ocorreu no mês **X**, a boleta só pode ser lançada dentro do mês **X**.

### RN-CICLO-02: Bloqueio Retroativo
Após o fechamento do período mensal, o sistema **BLOQUEIA** qualquer lançamento retroativo.
- **Consequência:** Venda não lançada no prazo implica em **PERDA** da comissão.
- **Justificativa:** Evitar manipulação de comissões, lançamentos fraudulentos, quebra de auditoria e divergências físico-digitais.
- **Ação do Sistema:** Rejeição automática de lançamentos com data anterior ao período aberto.

### RN-CICLO-03: Termo de Aceite "Perda por Não Lançamento"
O representante deve aceitar formalmente o termo durante o onboarding e no envio da primeira boleta.
> "Declaro que estou ciente de que boletas não lançadas dentro do mês de competência não serão pagas, conforme política da empresa. O sistema bloqueia lançamentos retroativos e não há revisão após o fechamento do período, salvo determinação expressa da diretoria."

### RN-CICLO-04: Liberação Excepcional
O gestor (Michel) pode, excepcionalmente, liberar uma boleta atrasada.
- **Requisitos:** Geração de log obrigatório contendo:
    - Justificativa
    - Nome do gestor
    - Data/hora
    - IP de origem
- **Marcação:** A boleta recebe a TAG: `Liberada Excepcionalmente (Risco Controlado)`.

---

## 2. Regra de Contestação pelo Gestor

O gestor possui autonomia para contestar lançamentos antes da aprovação final.

### RN-CON-01: Formalização
A contestação é uma ação formal que **pausa** o processo de pagamento da comissão específica.

### RN-CON-02: Resposta Obrigatória
O representante deve responder à contestação para que o processo continue.
- O sistema bloqueia a aprovação ou cancelamento até que haja uma resposta.

### RN-CON-03: Motivação
Toda contestação exige a seleção ou descrição de um motivo.
- **Exemplos:** Divergência de cálculo, anexo ilegível, valor líquido incoerente, cliente divergente, romaneio inconsistente.

### RN-CON-04: Trilha de Auditoria
O sistema deve registrar todo o histórico da contestação:
- Autor da contestação
- Motivo
- Troca de mensagens
- Arquivos complementares
- Desfecho

### RN-CON-05: Cancelamento Definitivo
Uma contestação pode evoluir para o cancelamento definitivo da comissão, exigindo justificativa obrigatória.

---

## 3. Termos Legais

Os seguintes termos devem constar na plataforma e serem aceitos pelos usuários.

### 3.1 Termo de Competência Mensal
> "O representante reconhece que a comissão é vinculada exclusivamente ao mês de competência da venda, sendo proibido o lançamento de boletas retroativas após o fechamento mensal. A perda do prazo implica perda da comissão, sem direito a reivindicação futura."

### 3.2 Termo de Contestação
> "O gestor possui autonomia para contestar lançamentos caso identifique inconsistências, divergências ou falta de comprovação documental, devendo o representante fornecer esclarecimentos. A ausência de resposta dentro do prazo pode levar ao cancelamento definitivo."

---

## 4. Auditoria e Ajustes do Sistema

Para garantir o cumprimento das regras, o sistema deve armazenar e validar:

- **Datas:**
    - Data real da venda
    - Data de lançamento
    - Data limite (configurada pelo gestor)
    - Data de fechamento automático mensal
- **Prevenção:** O sistema deve tornar impossível retroagir datas, fraudar registros ou inserir boletas antigas sem o fluxo de exceção.

---

## 5. Recursos do Sistema

### 5.1 Lançamento
- Campos obrigatórios e validação automática.
- Verificação de romaneio duplicado.
- Hash do anexo (para garantir integridade).
- Tipologia do chat.

### 5.2 Workflow (Estados da Comissão)
1.  `Aguardando`
2.  `Em análise`
3.  `Aprovada`
4.  `Contestada`
5.  `Cancelada`
6.  `Paga`
7.  `Fora do prazo`
8.  `Liberada Excepcionalmente` (TAG)

### 5.3 Datas e Ciclos Financeiros
- Configuração de data limite e fechamento mensal.
- Bloqueio retroativo automático.
- Aplicação da política de perda de comissão.

### 5.4 Gestão (Dashboard)
- Relatórios e auditoria.
- Geração de lote de pagamentos.
- Interface de contestação e aprovação final.

### 5.5 Representante (Mobile/Web)
- Interface simplificada.
- Lista básica de lançamentos.
- Chat integrado.
- Upload de comprovantes.

### 5.6 Legislação e Compliance
- Adequação à LGPD.
- Lei do Representante Comercial (Lei 4.886/65).
- Termo de não vínculo empregatício.
- Políticas de privacidade, cookies, antifraude e retenção de logs.
- Aceite dos termos no onboarding.

### 5.7 Segurança
- **RBAC:** Controle de acesso baseado em função.
- **Integridade:** Hash de anexos e logs imutáveis.
- **Rastreabilidade:** Registro de IP por transação.
- **Proteção:** Criptografia de dados sensíveis.
