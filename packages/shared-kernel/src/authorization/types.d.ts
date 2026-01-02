import { Ability, AbilityClass, MongoQuery } from '@casl/ability';
export type AppSubjects = 'User' | 'Product' | 'Client' | 'Order' | 'Dashboard' | 'Report' | 'Settings' | 'Organization' | 'Department' | 'Sector' | 'Position' | 'Permission' | 'all';
export type AppActions = 'manage' | 'create' | 'read' | 'update' | 'delete' | 'list' | 'view';
export type AppAbility = Ability<[AppActions, AppSubjects], MongoQuery>;
export declare const AppAbility: AbilityClass<AppAbility>;
