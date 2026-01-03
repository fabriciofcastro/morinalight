import { Ability, AbilityClass, MongoQuery } from '@casl/ability';

/**
 * Ações disponíveis no sistema CASL
 */
export type AppActions =
    // CRUD básico
    | 'manage'    // Acesso total (inclui todas as outras ações)
    | 'create'    // Criar novos recursos
    | 'read'      // Visualizar recursos
    | 'update'    // Editar recursos existentes
    | 'delete'    // Remover recursos
    // Ações especiais
    | 'approve'   // Aprovar (ex: pedidos, documentos)
    | 'reject'    // Rejeitar
    | 'publish'   // Publicar (ex: posts, produtos)
    | 'archive'   // Arquivar
    | 'export'    // Exportar dados
    | 'import';   // Importar dados

/**
 * Recursos (Subjects) disponíveis no sistema CASL
 */
export type AppSubjects =
    // Usuários e Equipe
    | 'User'
    | 'Role'
    | 'Permission'
    // Produtos e Catálogo
    | 'Product'
    | 'Category'
    // Clientes e Fornecedores
    | 'Client'
    | 'Supplier'
    // Pedidos e Vendas
    | 'Order'
    | 'OrderItem'
    // Organização
    | 'Organization'
    | 'Branch'
    | 'Department'
    | 'Sector'
    | 'Position'
    // Relatórios e Análises
    | 'Report'
    | 'Commission'
    | 'Dashboard'
    // Configurações
    | 'Settings'
    // Conteúdo
    | 'Post'
    | 'Document'
    | 'Workflow'
    | 'BusinessSegment'
    | 'TechnicalSheet'
    | 'Notification'
    // Especial
    | 'all'
    | Record<string, any>;

/**
 * Tipo principal da Ability do CASL
 */
export type AppAbility = Ability<[AppActions, AppSubjects], MongoQuery>;
export const AppAbility = Ability as AbilityClass<AppAbility>;
