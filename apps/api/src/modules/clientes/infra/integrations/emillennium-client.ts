/**
 * Cliente para integração com a API do e-millennium
 * 
 * Baseado na documentação oficial do e-millennium:
 * - API First: https://e-millennium.com.br/apis/integracao/
 * - Documentação de integração: https://e-millennium.com.br/apis/introducao-plataforma/
 * 
 * O e-millennium é um ERP Omnichannel que oferece API para integração.
 * Cada cliente tem particularidades em seu ambiente, então é necessário
 * um processo de homologação específico com o pós-venda do e-millennium.
 */

type EmillenniumConfig = {
  baseUrl: string;
  username: string;
  password: string;
  tenantId?: string;
  vitrineId?: string;
};

type EmillenniumPedido = {
  id: string;
  numeroPedido: string;
  numeroNotaFiscal?: string;
  clienteId?: string;
  clienteDocumento?: string;
  clienteNome?: string;
  dataVenda: string;
  dataPagamento?: string;
  valorTotal: number;
  status: string;
  itens?: Array<{
    produtoId: string;
    sku: string;
    quantidade: number;
    valorUnitario: number;
    valorTotal: number;
  }>;
};

export class EmillenniumClient {
  private readonly config: EmillenniumConfig;
  private accessToken?: string;
  private tokenExpiresAt?: Date;

  constructor(config: EmillenniumConfig) {
    this.config = config;
  }

  /**
   * Autentica no e-millennium e obtém token de acesso
   */
  async autenticar(): Promise<void> {
    try {
      const response = await fetch(`${this.config.baseUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: this.config.username,
          password: this.config.password,
          tenantId: this.config.tenantId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro na autenticação: ${response.statusText}`);
      }

      const data = (await response.json()) as {
        token: string;
        expiresIn: number;
      };

      this.accessToken = data.token;
      this.tokenExpiresAt = new Date(Date.now() + data.expiresIn * 1000);
    } catch (error) {
      console.error("Erro ao autenticar no e-millennium:", error);
      throw new Error("Falha na autenticação com e-millennium");
    }
  }

  /**
   * Verifica se o token ainda é válido e renova se necessário
   */
  private async garantirAutenticacao(): Promise<void> {
    if (
      !this.accessToken ||
      !this.tokenExpiresAt ||
      this.tokenExpiresAt < new Date()
    ) {
      await this.autenticar();
    }
  }

  /**
   * Busca pedidos do e-millennium por período
   */
  async buscarPedidos(params: {
    dataInicio: Date;
    dataFim: Date;
    status?: string;
    clienteDocumento?: string;
    limite?: number;
  }): Promise<EmillenniumPedido[]> {
    await this.garantirAutenticacao();

    try {
      const queryParams = new URLSearchParams({
        dataInicio: params.dataInicio.toISOString(),
        dataFim: params.dataFim.toISOString(),
        ...(params.status && { status: params.status }),
        ...(params.clienteDocumento && { clienteDocumento: params.clienteDocumento }),
        ...(params.limite && { limite: String(params.limite) }),
      });

      const response = await fetch(
        `${this.config.baseUrl}/api/pedidos?${queryParams.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Erro ao buscar pedidos: ${response.statusText}`);
      }

      const data = (await response.json()) as { pedidos: EmillenniumPedido[] };
      return data.pedidos;
    } catch (error) {
      console.error("Erro ao buscar pedidos do e-millennium:", error);
      throw new Error("Falha ao buscar pedidos do e-millennium");
    }
  }

  /**
   * Busca um pedido específico por ID
   */
  async buscarPedidoPorId(pedidoId: string): Promise<EmillenniumPedido | null> {
    await this.garantirAutenticacao();

    try {
      const response = await fetch(`${this.config.baseUrl}/api/pedidos/${pedidoId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`Erro ao buscar pedido: ${response.statusText}`);
      }

      return (await response.json()) as EmillenniumPedido;
    } catch (error) {
      console.error("Erro ao buscar pedido do e-millennium:", error);
      throw new Error("Falha ao buscar pedido do e-millennium");
    }
  }

  /**
   * Busca cliente por documento (CPF/CNPJ)
   */
  async buscarClientePorDocumento(documento: string): Promise<{
    id: string;
    nome: string;
    documento: string;
    email?: string;
    telefone?: string;
  } | null> {
    await this.garantirAutenticacao();

    try {
      const response = await fetch(
        `${this.config.baseUrl}/api/clientes?documento=${encodeURIComponent(documento)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`Erro ao buscar cliente: ${response.statusText}`);
      }

      const data = (await response.json()) as {
        clientes: Array<{
          id: string;
          nome: string;
          documento: string;
          email?: string;
          telefone?: string;
        }>;
      };

      return data.clientes[0] ?? null;
    } catch (error) {
      console.error("Erro ao buscar cliente do e-millennium:", error);
      throw new Error("Falha ao buscar cliente do e-millennium");
    }
  }

  /**
   * Testa a conexão com o e-millennium
   */
  async testarConexao(): Promise<boolean> {
    try {
      await this.autenticar();
      return true;
    } catch (error) {
      console.error("Erro ao testar conexão com e-millennium:", error);
      return false;
    }
  }
}

