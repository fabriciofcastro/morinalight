export interface MfaProvider {
  /**
   * Envia um código de autenticação para o usuário
   */
  sendCode(target: string, code: string): Promise<void>;

  /**
   * Verifica se o formato do alvo (email/telefone) é válido para este provedor
   */
  supports(target: string): boolean;
}
