# Assinatura Digital - Validade Jurídica e Implementação

> **Documentação completa sobre assinatura digital juridicamente válida para documentos e pedidos de venda de comissão.**
> Este documento define requisitos legais, técnicos e de implementação para aplicação futura.

---

## 1. Contexto e Objetivo

### 1.1 Necessidade

O sistema MORINA precisa de **assinatura digital juridicamente válida** para:

- ✅ **Pedidos de Venda de Comissão** (representantes)
- ✅ **Contratos de Representação**
- ✅ **Aprovações Gerenciais**
- ✅ **Documentos Financeiros**
- ✅ **Termos de Aceite**

### 1.2 Objetivo

Garantir que documentos assinados digitalmente tenham:

- **Validade jurídica** reconhecida
- **Autenticidade** comprovada
- **Integridade** preservada
- **Não repúdio** (impossibilidade de negar autoria)
- **Rastreabilidade** completa

---

## 2. Marco Legal Brasileiro

### 2.1 Legislação Aplicável

#### **Medida Provisória 2.200-2/2001 (ICP-Brasil)**

- Institui a Infraestrutura de Chaves Públicas Brasileira
- Define certificados digitais A1, A2, A3, A4
- **Validade jurídica plena** para documentos assinados com certificado ICP-Brasil

#### **Lei 14.063/2020**

- Amplia uso de assinaturas eletrônicas
- Reconhece validade de assinaturas não certificadas pela ICP-Brasil
- **Requisito:** Comprovar autoria e integridade

#### **Código Civil (Art. 107)**

- Documentos digitais têm validade jurídica
- Assinatura digital tem mesmo valor de assinatura física

#### **Lei 11.419/2006 (Processo Judicial Eletrônico)**

- Reconhece documentos digitais em processos judiciais
- Assinaturas digitais válidas para petições

### 2.2 Tipos de Assinatura Digital

#### **A. Assinatura Digital com Certificado ICP-Brasil** (Mais Forte)

**Características:**

- Certificado emitido por Autoridade Certificadora credenciada
- Validade jurídica **plena e automática**
- Presunção de autenticidade
- Não precisa comprovar autoria (presume-se válida)

**Exemplos de ACs:**

- Certisign
- Serasa Experian
- Valid
- AC CAIXA
- AC Banco do Brasil

**Tipos de Certificado:**

- **A1:** Software (arquivo no computador)
- **A2:** Cartão inteligente
- **A3:** Token USB
- **A4:** Nuvem (cloud)

**Custo:** R$ 100-300/ano (aproximado)

#### **B. Assinatura Eletrônica Simples** (Também Válida)

**Características:**

- Não usa certificado ICP-Brasil
- **Validade jurídica** se comprovar:
  - Autoria (quem assinou)
  - Integridade (documento não foi alterado)
  - Vontade de assinar

**Tecnologias:**

- Hash criptográfico (SHA-256, SHA-512)
- Timestamp confiável
- Biometria (impressão digital, reconhecimento facial)
- OTP (One-Time Password)
- Assinatura com senha + token

**Custo:** Baixo ou zero (depende da solução)

### 2.3 Validade Jurídica por Tipo

| Tipo                        | Validade Jurídica                          | Presunção            | Custo | Complexidade |
| --------------------------- | ------------------------------------------ | -------------------- | ----- | ------------ |
| **ICP-Brasil**              | ✅ Plena e automática                      | ✅ Presume-se válida | Alto  | Alta         |
| **Eletrônica Simples**      | ✅ Válida se comprovar autoria/integridade | ⚠️ Precisa comprovar | Baixo | Média        |
| **Assinatura Digitalizada** | ⚠️ Limitada                                | ❌ Não presume       | Zero  | Baixa        |

---

## 3. Requisitos para Validade Jurídica

### 3.1 Requisitos Obrigatórios (Qualquer Tipo)

#### **1. Autenticidade**

- ✅ Identificar **quem** assinou
- ✅ Comprovar que a pessoa é quem diz ser
- ✅ Método: Login + senha, biometria, certificado digital

#### **2. Integridade**

- ✅ Garantir que documento **não foi alterado** após assinatura
- ✅ Método: Hash criptográfico, timestamp, blockchain

#### **3. Não Repúdio**

- ✅ Impossibilitar negação de autoria
- ✅ Método: Logs auditáveis, evidências criptográficas

#### **4. Rastreabilidade**

- ✅ Registrar **quando** foi assinado
- ✅ Registrar **onde** foi assinado (IP, dispositivo)
- ✅ Manter histórico imutável

### 3.2 Evidências Necessárias

Para validar assinatura em juízo, o sistema deve armazenar:

```typescript
type AssinaturaDigital = {
  // Identificação
  documentoId: string;
  assinadoPor: string; // userId
  assinadoEm: Date;

  // Autenticidade
  metodoAutenticacao: "ICP-Brasil" | "Login" | "Biometria" | "OTP";
  certificadoDigital?: {
    serialNumber: string;
    issuer: string; // AC
    validFrom: Date;
    validTo: Date;
  };

  // Integridade
  hashDocumento: string; // SHA-256 do documento
  hashAssinatura: string; // Hash da assinatura
  timestamp: {
    valor: string; // RFC 3161
    autoridade: string; // TSA
  };

  // Rastreabilidade
  ipAddress: string;
  userAgent: string;
  dispositivo?: string;
  localizacao?: {
    latitude?: number;
    longitude?: number;
  };

  // Evidências adicionais
  logsAuditoria: Array<{
    evento: string;
    timestamp: Date;
    dados: Record<string, unknown>;
  }>;

  // PDF assinado (opcional)
  documentoAssinado?: {
    url: string;
    hash: string;
  };
};
```

---

## 4. Implementação no Sistema MORINA

### 4.1 Casos de Uso

#### **Caso 1: Assinatura de Pedido de Venda (Representante)**

**Fluxo:**

```
1. Representante preenche pedido
2. Clica em "Enviar para Aprovação"
3. Sistema solicita assinatura:
   - Opção A: Login + Senha (já autenticado)
   - Opção B: Certificado Digital ICP-Brasil
   - Opção C: Biometria (futuro)
4. Sistema gera hash do documento
5. Sistema registra assinatura com todas as evidências
6. Sistema gera PDF assinado (opcional)
7. Sistema envia para aprovação
```

**Requisitos:**

- ✅ Representante deve estar autenticado
- ✅ Documento deve ser "congelado" (não pode mais alterar)
- ✅ Hash deve ser calculado antes da assinatura
- ✅ Timestamp confiável (usar TSA - Time Stamping Authority)

#### **Caso 2: Aprovação Gerencial**

**Fluxo:**

```
1. Gestor visualiza pedido pendente
2. Clica em "Aprovar" ou "Reprovar"
3. Sistema solicita confirmação com senha
4. Sistema registra assinatura de aprovação
5. Sistema atualiza status do pedido
6. Sistema notifica representante
```

**Requisitos:**

- ✅ Gestor deve ter permissão de aprovação
- ✅ Assinatura deve incluir justificativa (se reprovar)
- ✅ Log completo de decisão

### 4.2 Arquitetura Proposta

#### **4.2.1 Módulo de Assinatura Digital**

```
packages/
└── digital-signature/
    ├── domain/
    │   ├── entities/
    │   │   ├── DigitalSignature.ts
    │   │   ├── Certificate.ts
    │   │   └── Timestamp.ts
    │   ├── value-objects/
    │   │   ├── Hash.ts
    │   │   └── SignatureMethod.ts
    │   └── repositories/
    │       └── ISignatureRepository.ts
    ├── application/
    │   ├── use-cases/
    │   │   ├── SignDocumentUseCase.ts
    │   │   ├── VerifySignatureUseCase.ts
    │   │   └── GenerateSignedPDFUseCase.ts
    │   └── services/
    │       ├── HashService.ts
    │       ├── TimestampService.ts
    │       └── CertificateValidationService.ts
    └── infrastructure/
        ├── repositories/
        │   └── PrismaSignatureRepository.ts
        ├── services/
        │   ├── ICPBrasilService.ts
        │   ├── TSAService.ts
        │   └── PDFSignerService.ts
        └── integrations/
            ├── certisign/
            ├── valid/
            └── timestamp-authority/
```

#### **4.2.2 Schema de Banco de Dados**

```prisma
model DigitalSignature {
  id            String   @id @default(uuid())
  documentoId   String   // ID do documento assinado
  documentoTipo String   // 'PEDIDO_VENDA' | 'CONTRATO' | 'APROVACAO'

  // Assinante
  assinadoPor   String   // userId
  assinadoEm    DateTime @default(now())

  // Método de Assinatura
  metodo        SignatureMethod

  // Certificado Digital (se ICP-Brasil)
  certificadoId String?
  certificado   Certificate? @relation(fields: [certificadoId], references: [id])

  // Integridade
  hashDocumento String   // SHA-256 do documento original
  hashAssinatura String  // Hash da assinatura

  // Timestamp
  timestampId   String?
  timestamp     Timestamp? @relation(fields: [timestampId], references: [id])

  // Rastreabilidade
  ipAddress     String
  userAgent     String
  dispositivo   String?

  // Evidências
  evidencias    Json     // Dados adicionais

  // PDF Assinado (opcional)
  pdfAssinadoUrl String?
  pdfAssinadoHash String?

  // Auditoria
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  certificado   Certificate? @relation("CertificateSignatures")
  timestamp     Timestamp? @relation("TimestampSignatures")

  @@index([documentoId, documentoTipo])
  @@index([assinadoPor])
  @@index([assinadoEm])
}

model Certificate {
  id            String   @id @default(uuid())
  serialNumber  String   @unique
  issuer        String   // Autoridade Certificadora
  subject       String   // CN (Common Name)
  validFrom     DateTime
  validTo       DateTime
  tipo          String   // 'A1' | 'A2' | 'A3' | 'A4'
  status        String   // 'VALID' | 'REVOKED' | 'EXPIRED'

  // Relacionamento
  signatures    DigitalSignature[] @relation("CertificateSignatures")

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Timestamp {
  id            String   @id @default(uuid())
  valor         String   // RFC 3161 timestamp token
  autoridade    String   // TSA (Time Stamping Authority)
  hashDocumento String
  emitidoEm     DateTime

  // Relacionamento
  signatures    DigitalSignature[] @relation("TimestampSignatures")

  createdAt     DateTime @default(now())
}

enum SignatureMethod {
  ICP_BRASIL
  LOGIN_SENHA
  BIOMETRIA
  OTP
  TOKEN
}
```

### 4.3 Serviços Necessários

#### **4.3.1 HashService**

```typescript
export class HashService {
  /**
   * Gera hash SHA-256 do documento
   */
  async generateHash(document: string | Buffer): Promise<string> {
    // Implementação usando crypto
  }

  /**
   * Verifica integridade do documento
   */
  async verifyIntegrity(
    document: string | Buffer,
    expectedHash: string,
  ): Promise<boolean> {
    // Compara hash atual com hash esperado
  }
}
```

#### **4.3.2 TimestampService**

```typescript
export class TimestampService {
  /**
   * Obtém timestamp confiável de TSA
   */
  async getTrustedTimestamp(hash: string): Promise<Timestamp> {
    // Integração com TSA (Time Stamping Authority)
    // Exemplos: Certisign TSA, Valid TSA, ou serviço próprio
  }

  /**
   * Verifica validade do timestamp
   */
  async verifyTimestamp(timestamp: Timestamp): Promise<boolean> {
    // Valida assinatura do timestamp
  }
}
```

#### **4.3.3 ICPBrasilService**

```typescript
export class ICPBrasilService {
  /**
   * Valida certificado digital ICP-Brasil
   */
  async validateCertificate(
    certificate: Buffer | string,
  ): Promise<CertificateValidation> {
    // Valida certificado contra AC
    // Verifica se não está revogado
    // Verifica validade
  }

  /**
   * Assina documento com certificado
   */
  async signWithCertificate(
    document: Buffer,
    certificate: Certificate,
  ): Promise<SignedDocument> {
    // Assina usando certificado digital
    // Gera assinatura PKCS#7 ou PAdES
  }
}
```

---

## 5. Fluxo de Assinatura de Pedido de Venda

### 5.1 Fluxo Completo

```
┌─────────────────────────────────────────────────────────────┐
│  1. REPRESENTANTE PREENCHE PEDIDO                           │
│     • Dados do pedido                                       │
│     • Cliente, valor, data, etc.                           │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  2. CLICA EM "ENVIAR PARA APROVAÇÃO"                       │
│     • Sistema valida dados                                  │
│     • Sistema "congela" documento (não pode mais alterar)  │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  3. SISTEMA SOLICITA ASSINATURA                             │
│     ┌─────────────────────────────────────────────────┐    │
│     │  ASSINAR DOCUMENTO                               │    │
│     │  ───────────────────────────────────────────────  │    │
│     │                                                  │    │
│     │  Documento: Pedido #65742                       │    │
│     │  Valor: R$ 2.785,98                             │    │
│     │  Cliente: BNG SCHNEIDER                         │    │
│     │                                                  │    │
│     │  Método de Assinatura:                          │    │
│     │  ( ) Login + Senha (já autenticado)            │    │
│     │  ( ) Certificado Digital ICP-Brasil            │    │
│     │                                                  │    │
│     │  [ Cancelar ]  [ Assinar ]                      │    │
│     └─────────────────────────────────────────────────┘    │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  4. SISTEMA PROCESSA ASSINATURA                             │
│     • Gera hash SHA-256 do documento                        │
│     • Registra método de autenticação                       │
│     • Obtém timestamp confiável (TSA)                       │
│     • Armazena evidências (IP, user agent, etc.)           │
│     • Cria registro de assinatura                           │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  5. SISTEMA GERA PDF ASSINADO (OPCIONAL)                    │
│     • Gera PDF do documento                                 │
│     • Adiciona assinatura visual                            │
│     • Adiciona hash e timestamp                             │
│     • Armazena PDF assinado                                 │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  6. SISTEMA ENVIA PARA APROVAÇÃO                            │
│     • Status: "Aguardando Aprovação"                        │
│     • Notifica gestor                                       │
│     • Documento não pode mais ser alterado                  │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Validação de Assinatura

```
┌─────────────────────────────────────────────────────────────┐
│  VERIFICAR ASSINATURA                                        │
│  ─────────────────────────────────────────────────────────── │
│                                                              │
│  Documento: Pedido #65742                                   │
│  Assinado por: João Silva                                    │
│  Assinado em: 15/12/2024 14:30:25                           │
│                                                              │
│  ✅ Autenticidade: Verificada                                │
│     • Login confirmado                                       │
│     • Sessão válida                                          │
│                                                              │
│  ✅ Integridade: Verificada                                  │
│     • Hash do documento: 7a3f8b2c...                        │
│     • Hash atual: 7a3f8b2c... (igual)                      │
│     • Documento não foi alterado                            │
│                                                              │
│  ✅ Timestamp: Válido                                        │
│     • Emitido por: TSA Certisign                            │
│     • Data: 15/12/2024 14:30:25 UTC                         │
│                                                              │
│  ✅ Rastreabilidade: Completa                                 │
│     • IP: 192.168.1.100                                     │
│     • Dispositivo: Chrome 120.0 / Windows 11                │
│     • Localização: São Paulo, SP                             │
│                                                              │
│  [ Ver PDF Assinado ]  [ Ver Logs Completos ]               │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Soluções de Assinatura Digital

### 6.1 Soluções ICP-Brasil (Certificados Digitais)

#### **A. Certisign**

- **Website:** https://www.certisign.com.br
- **Produtos:** Certificado A1, A3, TSA
- **API:** Sim (REST)
- **Custo:** ~R$ 200-300/ano
- **Integração:** SDK disponível

#### **B. Valid**

- **Website:** https://www.valid.com.br
- **Produtos:** Certificado A1, A3, TSA
- **API:** Sim
- **Custo:** ~R$ 150-250/ano
- **Integração:** SDK disponível

#### **C. Serasa Experian**

- **Website:** https://www.serasaexperian.com.br
- **Produtos:** Certificado digital, TSA
- **API:** Sim
- **Custo:** ~R$ 200-300/ano

### 6.2 Soluções de Assinatura Eletrônica Simples

#### **A. DocuSign**

- **Website:** https://www.docusign.com.br
- **Tipo:** Assinatura eletrônica
- **API:** Sim (REST)
- **Custo:** ~$15-45/mês por usuário
- **Validade:** Reconhecida judicialmente (comprovando autoria)

#### **B. Adobe Sign**

- **Website:** https://www.adobe.com/sign
- **Tipo:** Assinatura eletrônica
- **API:** Sim
- **Custo:** ~$15-35/mês por usuário

#### **C. Solução Própria (Recomendada para MORINA)**

**Vantagens:**

- ✅ Controle total
- ✅ Custo baixo (apenas infraestrutura)
- ✅ Integração completa com sistema
- ✅ Validade jurídica (comprovando autoria/integridade)

**Requisitos:**

- Hash criptográfico (SHA-256)
- Timestamp confiável (TSA ou próprio)
- Logs auditáveis
- Armazenamento seguro

---

## 7. Implementação Recomendada (Faseada)

### 7.1 Fase 1: Assinatura Eletrônica Simples (MVP)

**Objetivo:** Implementar assinatura válida juridicamente sem certificado ICP-Brasil

**Implementação:**

1. ✅ Hash SHA-256 do documento
2. ✅ Timestamp próprio (validado por logs)
3. ✅ Autenticação via login
4. ✅ Registro completo de evidências
5. ✅ PDF assinado visualmente

**Validade Jurídica:**

- ✅ Válida se comprovar autoria (login) e integridade (hash)
- ✅ Reconhecida judicialmente (precedentes)

**Custo:** Baixo (apenas desenvolvimento)

**Prazo:** 2-3 sprints

### 7.2 Fase 2: Integração com TSA (Time Stamping Authority)

**Objetivo:** Adicionar timestamp confiável de terceiro

**Implementação:**

1. ✅ Integração com TSA (Certisign, Valid, ou próprio)
2. ✅ Timestamp RFC 3161
3. ✅ Validação de timestamp

**Validade Jurídica:**

- ✅ Timestamp confiável de terceiro
- ✅ Maior segurança jurídica

**Custo:** Médio (assinatura TSA ~R$ 50-100/mês)

**Prazo:** 1 sprint adicional

### 7.3 Fase 3: Suporte a Certificado ICP-Brasil (Opcional)

**Objetivo:** Permitir assinatura com certificado digital

**Implementação:**

1. ✅ Integração com AC (Autoridade Certificadora)
2. ✅ Validação de certificado
3. ✅ Assinatura PKCS#7 ou PAdES
4. ✅ Interface para upload/uso de certificado

**Validade Jurídica:**

- ✅ Validade jurídica plena e automática
- ✅ Presunção de autenticidade

**Custo:** Alto (certificado ~R$ 200-300/ano por usuário)

**Prazo:** 2-3 sprints

---

## 8. Checklist de Implementação

### 8.1 Requisitos Técnicos

- [ ] Módulo de assinatura digital criado
- [ ] Schema de banco de dados definido
- [ ] HashService implementado (SHA-256)
- [ ] TimestampService implementado
- [ ] Repositório de assinaturas
- [ ] Use cases de assinatura e verificação
- [ ] API endpoints criados
- [ ] Frontend de assinatura
- [ ] Geração de PDF assinado
- [ ] Validação de assinatura

### 8.2 Requisitos Legais

- [ ] Termo de uso de assinatura digital
- [ ] Política de retenção de documentos
- [ ] Política de backup e recuperação
- [ ] Documentação de evidências
- [ ] Procedimento de validação judicial

### 8.3 Requisitos de Segurança

- [ ] Logs auditáveis (não podem ser alterados)
- [ ] Armazenamento seguro de hashes
- [ ] Backup de assinaturas
- [ ] Criptografia de dados sensíveis
- [ ] Controle de acesso

### 8.4 Requisitos de UX

- [ ] Interface clara de assinatura
- [ ] Feedback visual de assinatura
- [ ] Visualização de documento assinado
- [ ] Validação de assinatura visível
- [ ] Download de PDF assinado

---

## 9. Exemplo de Código (TypeScript)

### 9.1 Use Case de Assinatura

```typescript
export class SignDocumentUseCase {
  constructor(
    private hashService: HashService,
    private timestampService: TimestampService,
    private signatureRepository: ISignatureRepository,
    private auditService: AuditService,
  ) {}

  async execute(input: SignDocumentInput): Promise<SignDocumentOutput> {
    // 1. Validar documento existe e pode ser assinado
    const documento = await this.documentRepository.findById(input.documentoId);
    if (!documento || documento.status !== "PENDENTE_ASSINATURA") {
      throw new Error("Documento não pode ser assinado");
    }

    // 2. Gerar hash do documento
    const documentoString = JSON.stringify(documento);
    const hashDocumento = await this.hashService.generateHash(documentoString);

    // 3. Obter timestamp confiável
    const timestamp =
      await this.timestampService.getTrustedTimestamp(hashDocumento);

    // 4. Criar assinatura
    const assinatura = DigitalSignature.create({
      documentoId: input.documentoId,
      documentoTipo: input.documentoTipo,
      assinadoPor: input.userId,
      metodo: input.metodo,
      hashDocumento,
      timestamp,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      evidencias: {
        sessaoId: input.sessaoId,
        dispositivo: input.dispositivo,
      },
    });

    // 5. Salvar assinatura
    await this.signatureRepository.save(assinatura);

    // 6. Atualizar documento
    documento.marcarComoAssinado(assinatura.id);
    await this.documentRepository.save(documento);

    // 7. Auditoria
    await this.auditService.registrar({
      evento: "DOCUMENTO_ASSINADO",
      documentoId: input.documentoId,
      assinadoPor: input.userId,
      assinaturaId: assinatura.id,
    });

    // 8. Gerar PDF assinado (opcional)
    const pdfAssinado = await this.pdfService.gerarPDFAssinado(
      documento,
      assinatura,
    );

    return {
      assinaturaId: assinatura.id,
      hashDocumento,
      timestamp: timestamp.valor,
      pdfAssinadoUrl: pdfAssinado.url,
    };
  }
}
```

### 9.2 Use Case de Verificação

```typescript
export class VerifySignatureUseCase {
  constructor(
    private hashService: HashService,
    private signatureRepository: ISignatureRepository,
    private timestampService: TimestampService,
  ) {}

  async execute(input: VerifySignatureInput): Promise<VerifySignatureOutput> {
    // 1. Buscar assinatura
    const assinatura = await this.signatureRepository.findByDocumento(
      input.documentoId,
    );

    if (!assinatura) {
      return { valida: false, motivo: "Assinatura não encontrada" };
    }

    // 2. Verificar integridade
    const documentoAtual = await this.documentRepository.findById(
      input.documentoId,
    );
    const hashAtual = await this.hashService.generateHash(
      JSON.stringify(documentoAtual),
    );

    const integridadeOk = hashAtual === assinatura.hashDocumento;

    // 3. Verificar timestamp
    const timestampOk = await this.timestampService.verifyTimestamp(
      assinatura.timestamp,
    );

    // 4. Verificar certificado (se ICP-Brasil)
    let certificadoOk = true;
    if (assinatura.metodo === "ICP_BRASIL") {
      certificadoOk = await this.certificateService.validateCertificate(
        assinatura.certificado,
      );
    }

    return {
      valida: integridadeOk && timestampOk && certificadoOk,
      detalhes: {
        integridade: integridadeOk,
        timestamp: timestampOk,
        certificado: certificadoOk,
        assinadoPor: assinatura.assinadoPor,
        assinadoEm: assinatura.assinadoEm,
      },
    };
  }
}
```

---

## 10. Custos Estimados

### 10.1 Solução Própria (Recomendada)

**Desenvolvimento:**

- Fase 1 (MVP): 2-3 sprints
- Fase 2 (TSA): 1 sprint adicional
- Fase 3 (ICP-Brasil): 2-3 sprints (opcional)

**Infraestrutura:**

- Servidor: Já existente
- Armazenamento: ~R$ 50-100/mês (S3 ou similar)
- TSA: ~R$ 50-100/mês (opcional)

**Total Fase 1:** ~R$ 0-100/mês (apenas infraestrutura)

### 10.2 Solução Terceirizada (DocuSign/Adobe Sign)

**Custo:**

- ~$15-45/mês por usuário
- Para 100 representantes: ~$1.500-4.500/mês (~R$ 7.500-22.500/mês)

**Vantagens:**

- Implementação rápida
- Interface pronta
- Suporte jurídico

**Desvantagens:**

- Custo alto em escala
- Menos controle
- Dependência de terceiro

---

## 11. Recomendação Final

### 11.1 Para Pedidos de Venda de Comissão

**Recomendação:** **Solução Própria - Fase 1 (MVP)**

**Justificativa:**

- ✅ Validade jurídica garantida (comprovando autoria/integridade)
- ✅ Custo baixo
- ✅ Controle total
- ✅ Integração completa
- ✅ Precedentes judiciais favoráveis

**Implementação:**

1. Hash SHA-256 do documento
2. Timestamp próprio (validado por logs)
3. Autenticação via login (já existe)
4. Registro completo de evidências
5. PDF assinado visualmente

### 11.2 Para Contratos Importantes

**Recomendação:** **Solução Própria + TSA (Fase 2)**

**Justificativa:**

- ✅ Timestamp confiável de terceiro
- ✅ Maior segurança jurídica
- ✅ Custo ainda razoável

### 11.3 Para Documentos Críticos (Opcional)

**Recomendação:** **Suporte a ICP-Brasil (Fase 3)**

**Justificativa:**

- ✅ Validade jurídica plena e automática
- ✅ Presunção de autenticidade
- ⚠️ Custo alto (usuário paga certificado)

---

## 12. Próximos Passos

### 12.1 Imediato (Documentação)

- [x] Documentação completa criada
- [ ] Revisar com equipe jurídica
- [ ] Validar requisitos legais
- [ ] Definir política de retenção

### 12.2 Curto Prazo (Planejamento)

- [ ] Criar ADR (Architecture Decision Record)
- [ ] Definir arquitetura técnica
- [ ] Estimar esforço de desenvolvimento
- [ ] Priorizar no backlog

### 12.3 Médio Prazo (Implementação)

- [ ] Implementar Fase 1 (MVP)
- [ ] Testes de validação jurídica
- [ ] Documentação de uso
- [ ] Treinamento de usuários

---

## 13. Referências Legais

1. **Medida Provisória 2.200-2/2001** - ICP-Brasil
2. **Lei 14.063/2020** - Assinaturas Eletrônicas
3. **Código Civil (Art. 107)** - Validade de documentos digitais
4. **Lei 11.419/2006** - Processo Judicial Eletrônico
5. **Resolução CNJ 332/2020** - Assinatura digital em processos

---

## 14. Referências Técnicas

1. **RFC 3161** - Internet X.509 Public Key Infrastructure Time-Stamp Protocol
2. **PKCS#7** - Cryptographic Message Syntax
3. **PAdES** - PDF Advanced Electronic Signatures
4. **SHA-256** - Secure Hash Algorithm 256-bit

---

**Última atualização:** 2025-01-19  
**Versão:** 1.0.0  
**Status:** Documentação para implementação futura  
**Próxima revisão:** Após validação jurídica
