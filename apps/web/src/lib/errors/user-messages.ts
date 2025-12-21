/**
 * Mensagens Amigáveis para Usuários
 * 
 * Traduz códigos de erro técnicos em mensagens amigáveis
 * e acionáveis para o usuário final.
 */

import { ErrorCode, type AppError } from "./types";

/**
 * Mapeamento de códigos de erro para mensagens amigáveis em português
 */
const USER_FRIENDLY_MESSAGES: Record<string, { title: string; message: string; action?: string }> = {
  // Validação
  [ErrorCode.VALIDATION_ERROR]: {
    title: "Dados Inválidos",
    message: "Por favor, verifique os dados informados e tente novamente.",
    action: "Verificar campos",
  },
  [ErrorCode.INVALID_INPUT]: {
    title: "Entrada Inválida",
    message: "Os dados informados não estão no formato correto.",
    action: "Corrigir dados",
  },
  [ErrorCode.MISSING_REQUIRED_FIELD]: {
    title: "Campo Obrigatório",
    message: "Preencha todos os campos obrigatórios antes de continuar.",
    action: "Preencher campos",
  },
  [ErrorCode.INVALID_FORMAT]: {
    title: "Formato Inválido",
    message: "O formato dos dados informados está incorreto.",
    action: "Verificar formato",
  },

  // Autenticação
  [ErrorCode.AUTHENTICATION_ERROR]: {
    title: "Autenticação Necessária",
    message: "Você precisa fazer login para acessar este recurso.",
    action: "Fazer Login",
  },
  [ErrorCode.INVALID_CREDENTIALS]: {
    title: "Credenciais Inválidas",
    message: "Email ou senha incorretos. Verifique suas credenciais e tente novamente.",
    action: "Tentar Novamente",
  },
  [ErrorCode.TOKEN_EXPIRED]: {
    title: "Sessão Expirada",
    message: "Sua sessão expirou por segurança. Por favor, faça login novamente.",
    action: "Fazer Login",
  },
  [ErrorCode.TOKEN_INVALID]: {
    title: "Sessão Inválida",
    message: "Sua sessão não é mais válida. Por favor, faça login novamente.",
    action: "Fazer Login",
  },
  [ErrorCode.SESSION_EXPIRED]: {
    title: "Sessão Expirada",
    message: "Sua sessão expirou. Por favor, faça login novamente para continuar.",
    action: "Fazer Login",
  },

  // Autorização
  [ErrorCode.AUTHORIZATION_ERROR]: {
    title: "Acesso Negado",
    message: "Você não tem permissão para realizar esta ação.",
    action: "Contatar Administrador",
  },
  [ErrorCode.INSUFFICIENT_PERMISSIONS]: {
    title: "Permissão Insuficiente",
    message: "Você não possui as permissões necessárias para esta operação.",
    action: "Solicitar Permissão",
  },
  [ErrorCode.FORBIDDEN_RESOURCE]: {
    title: "Acesso Restrito",
    message: "Você não tem acesso a este recurso.",
    action: "Verificar Permissões",
  },

  // Not Found
  [ErrorCode.NOT_FOUND]: {
    title: "Não Encontrado",
    message: "O recurso solicitado não foi encontrado.",
    action: "Voltar",
  },
  [ErrorCode.RESOURCE_NOT_FOUND]: {
    title: "Recurso Não Encontrado",
    message: "O item que você está procurando não existe ou foi removido.",
    action: "Voltar",
  },

  // Conflito
  [ErrorCode.CONFLICT]: {
    title: "Conflito",
    message: "Não foi possível concluir a operação devido a um conflito.",
    action: "Tentar Novamente",
  },
  [ErrorCode.DUPLICATE_RESOURCE]: {
    title: "Item Duplicado",
    message: "Este item já existe no sistema.",
    action: "Verificar Dados",
  },

  // Rate Limit
  [ErrorCode.RATE_LIMIT_EXCEEDED]: {
    title: "Muitas Tentativas",
    message: "Você fez muitas requisições. Por favor, aguarde um momento antes de tentar novamente.",
    action: "Aguardar",
  },
  [ErrorCode.TOO_MANY_REQUESTS]: {
    title: "Limite de Requisições",
    message: "Você excedeu o limite de requisições. Aguarde alguns instantes.",
    action: "Aguardar",
  },

  // Erros de Servidor
  [ErrorCode.INTERNAL_ERROR]: {
    title: "Erro Interno",
    message: "Ocorreu um erro inesperado. Nossa equipe foi notificada e está trabalhando para resolver.",
    action: "Tentar Novamente",
  },
  [ErrorCode.DATABASE_ERROR]: {
    title: "Erro no Banco de Dados",
    message: "Não foi possível acessar os dados. Tente novamente em alguns instantes.",
    action: "Tentar Novamente",
  },
  [ErrorCode.EXTERNAL_SERVICE_ERROR]: {
    title: "Serviço Indisponível",
    message: "Um serviço externo está temporariamente indisponível. Tente novamente mais tarde.",
    action: "Tentar Mais Tarde",
  },
  [ErrorCode.TIMEOUT]: {
    title: "Tempo Esgotado",
    message: "A operação demorou muito para responder. Verifique sua conexão e tente novamente.",
    action: "Tentar Novamente",
  },
  [ErrorCode.SERVICE_UNAVAILABLE]: {
    title: "Serviço Indisponível",
    message: "O serviço está temporariamente indisponível. Estamos trabalhando para resolver.",
    action: "Tentar Mais Tarde",
  },
  [ErrorCode.NETWORK_ERROR]: {
    title: "Erro de Conexão",
    message: "Não foi possível conectar ao servidor. Verifique sua conexão com a internet.",
    action: "Verificar Conexão",
  },
};

/**
 * Obter mensagem amigável para um erro
 */
export function getUserFriendlyMessage(error: AppError | Error | unknown): {
  title: string;
  message: string;
  action?: string;
  icon?: string;
  severity: "info" | "warning" | "error" | "critical";
} {
  // Se já é um AppError, usar diretamente
  let appError: AppError;
  if (error instanceof AppError) {
    appError = error;
  } else if (error instanceof Error) {
    // Converter Error genérico para AppError
    appError = new AppError(
      ErrorCode.INTERNAL_ERROR,
      error.message,
      500,
    );
  } else {
    // Erro desconhecido
    appError = new AppError(
      ErrorCode.INTERNAL_ERROR,
      "Ocorreu um erro inesperado",
      500,
    );
  }

  // Buscar mensagem amigável
  const friendly = USER_FRIENDLY_MESSAGES[appError.code] || {
    title: "Erro",
    message: appError.getUserMessage(),
    action: "Tentar Novamente",
  };

  // Determinar ícone baseado na severidade
  let icon = "alert-circle";
  if (appError.severity === "critical") {
    icon = "alert-triangle";
  } else if (appError.severity === "high") {
    icon = "x-circle";
  } else if (appError.severity === "medium") {
    icon = "info";
  }

  // Determinar tipo de notificação
  let severity: "info" | "warning" | "error" | "critical" = "error";
  if (appError.severity === "critical") {
    severity = "critical";
  } else if (appError.severity === "high") {
    severity = "error";
  } else if (appError.severity === "medium") {
    severity = "warning";
  } else {
    severity = "info";
  }

  // Se tem campos de validação, adicionar informações
  if (appError.fields && appError.fields.length > 0) {
    const fieldsList = appError.fields
      .map((f) => `• ${f.field}: ${f.message}`)
      .join("\n");
    return {
      title: friendly.title,
      message: `${friendly.message}\n\n${fieldsList}`,
      action: friendly.action,
      icon,
      severity,
    };
  }

  return {
    ...friendly,
    icon,
    severity,
  };
}

/**
 * Obter mensagem curta para notificações
 */
export function getShortMessage(error: AppError | Error | unknown): string {
  const friendly = getUserFriendlyMessage(error);
  return friendly.message;
}

/**
 * Obter título para notificações
 */
export function getErrorTitle(error: AppError | Error | unknown): string {
  const friendly = getUserFriendlyMessage(error);
  return friendly.title;
}





