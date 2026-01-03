import { Ability, AbilityClass, MongoQuery } from '@casl/ability';
/**
 * Ações disponíveis no sistema CASL
 */
export type AppActions = 'manage' | 'create' | 'read' | 'update' | 'delete' | 'approve' | 'reject' | 'publish' | 'archive' | 'export' | 'import';
/**
 * Recursos (Subjects) disponíveis no sistema CASL
 */
export type AppSubjects = 'User' | 'Role' | 'Permission' | 'Product' | 'Category' | 'Client' | 'Supplier' | 'Order' | 'OrderItem' | 'Organization' | 'Branch' | 'Department' | 'Sector' | 'Position' | 'Report' | 'Commission' | 'Dashboard' | 'Settings' | 'Post' | 'Document' | 'Workflow' | 'TechnicalSheet' | 'Notification' | 'all';
/**
 * Tipo principal da Ability do CASL
 */
export type AppAbility = Ability<[AppActions, AppSubjects], MongoQuery>;
export declare const AppAbility: AbilityClass<AppAbility>;
