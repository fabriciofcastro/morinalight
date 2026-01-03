/**
 * Complete Usage Examples - All Patterns
 * 
 * Exemplos práticos de uso de todos os patterns implementados
 */

import React from "react";

// ============================================
// 1. RBAC/ABAC - Authorization
// ============================================

import { Can, useCan, usePermission } from "@/lib/auth";
import { ACTIONS, RESOURCES } from "@/lib/auth/rbac";

function UserManagement() {
    const canCreate = useCan(ACTIONS.CREATE, RESOURCES.USERS);
    const canDelete = useCan(ACTIONS.DELETE, RESOURCES.USERS);
    const hasPermission = usePermission("users:update");

    return (
        <div>
            <h1>User Management</h1>

            {/* Conditional rendering with hook */}
            {canCreate && <button>Create User</button>}

            {/* Conditional rendering with component */}
            <Can action={ACTIONS.UPDATE} resource={RESOURCES.USERS}>
                <button>Edit User</button>
            </Can>

            <Can action={ACTIONS.DELETE} resource={RESOURCES.USERS}>
                <button>Delete User</button>
            </Can>
        </div>
    );
}

// ============================================
// 2. Event-Driven Architecture
// ============================================

import { eventBus, USER_EVENTS, PRODUCT_EVENTS, ORDER_EVENTS } from "@/lib/events";

async function createUser(data: any) {
    // Criar usuário
    const user = await userRepository.create(data);

    // Emitir evento - handlers executam automaticamente
    await eventBus.emit(USER_EVENTS.CREATED, {
        userId: user.id,
        email: user.email,
        name: user.name,
    });

    // Handlers que executam:
    // 1. Enviar email de boas-vindas
    // 2. Criar audit log
    // 3. Notificar admins

    return user;
}

async function createOrder(orderData: any) {
    const order = await orderRepository.create(orderData);

    // Emitir evento
    await eventBus.emit(ORDER_EVENTS.CREATED, {
        orderId: order.id,
        customerEmail: orderData.customerEmail,
        items: orderData.items,
        total: orderData.total,
    });

    // Handlers que executam:
    // 1. Enviar confirmação de pedido
    // 2. Atualizar estoque
    // 3. Processar pagamento

    return order;
}

// ============================================
// 3. Repository Pattern
// ============================================

import { userRepository, productRepository } from "@/lib/repositories";

async function getUserExample() {
    // Buscar por ID
    const user = await userRepository.findById("123");

    // Buscar por email
    const userByEmail = await userRepository.findByEmail("user@example.com");

    // Buscar todos com filtros
    const activeUsers = await userRepository.findAll({
        status: "active",
        orderBy: "createdAt",
        order: "desc",
        limit: 50,
    });

    // Contar
    const count = await userRepository.count({ status: "active" });

    return { user, userByEmail, activeUsers, count };
}

async function getProductsExample() {
    // Buscar produtos com estoque baixo
    const lowStock = await productRepository.findLowStock();

    // Buscar por categoria
    const products = await productRepository.findByCategory("cat-123");

    // Buscar por SKU
    const product = await productRepository.findBySku("SKU-001");

    // Atualizar estoque
    await productRepository.updateStock("prod-123", 10, "IN");

    // Busca
    const results = await productRepository.search("notebook");

    return { lowStock, products, product, results };
}

// ============================================
// 4. Strategy Pattern - Auth
// ============================================

import { AuthContext, EmailPasswordStrategy, OAuth2Strategy, SSOStrategy } from "@/lib/patterns";

async function loginExamples() {
    // Email/Password
    const emailStrategy = new EmailPasswordStrategy();
    const authContext = new AuthContext(emailStrategy);

    const result1 = await authContext.authenticate({
        email: "user@example.com",
        password: "password123",
    });

    // OAuth2 (Google)
    const googleStrategy = new OAuth2Strategy("google");
    authContext.setStrategy(googleStrategy);

    const result2 = await authContext.authenticate({
        token: "google-oauth-token",
        provider: "google",
    });

    // SSO/SAML
    const ssoStrategy = new SSOStrategy();
    authContext.setStrategy(ssoStrategy);

    const result3 = await authContext.authenticate({
        samlToken: "saml-token",
    });

    return { result1, result2, result3 };
}

// ============================================
// 5. Strategy Pattern - Notifications
// ============================================

import { notificationService } from "@/lib/patterns";

async function notificationExamples() {
    // Email
    await notificationService.send("email", {
        to: "user@example.com",
        subject: "Welcome!",
        message: "<h1>Welcome to our platform</h1>",
    });

    // SMS
    await notificationService.send("sms", {
        to: "+5511999999999",
        message: "Your verification code is 123456",
    });

    // Push notification
    await notificationService.send("push", {
        to: "user-123",
        message: "You have a new message",
        data: { messageId: "msg-456" },
    });

    // Múltiplos canais
    await notificationService.sendMultiple(["email", "sms", "push"], {
        to: "user-123",
        message: "Important notification",
    });
}

// ============================================
// 6. LGPD Compliance
// ============================================

import {
    CookieConsentBanner,
    useCookieConsent,
    dataPortabilityService,
    dataDeletionService,
} from "@/lib/lgpd";

function CookieConsentExample() {
    const { consent, giveConsent, hasConsent } = useCookieConsent();

    const canUseAnalytics = hasConsent("analytics");

    return (
        <div>
            <CookieConsentBanner />

            {canUseAnalytics && (
                <script src="analytics.js" />
            )}
        </div>
    );
}

async function lgpdExamples() {
    // Exportar dados (Portabilidade)
    const blob = await dataPortabilityService.exportUserData(
        "user-123",
        "user-123",
        "json"
    );

    // Enviar dados por email
    await dataPortabilityService.sendDataByEmail(
        "user-123",
        "user@example.com"
    );

    // Solicitar exclusão (Direito ao Esquecimento)
    const deletionRequest = await dataDeletionService.requestDeletion(
        "user-123",
        "user-123",
        "Não quero mais usar o serviço"
    );

    // Verificar se pode deletar
    const { canDelete, reasons } = await dataDeletionService.canDeleteData("user-123");

    return { blob, deletionRequest, canDelete, reasons };
}

// ============================================
// 7. Audit Trail
// ============================================

import { auditService, Auditable } from "@/lib/audit/audit-service";

// Uso direto
async function auditExamples() {
    // Log de sucesso
    await auditService.logSuccess(
        "user_created",
        "admin-123",
        "user",
        {
            resourceId: "user-456",
            metadata: { email: "newuser@example.com" },
        }
    );

    // Log de acesso a dados (LGPD)
    await auditService.logDataAccess(
        "user-123",
        "personal_data",
        "user-456",
        "Visualização de perfil"
    );

    // Log de alteração de dados (LGPD)
    await auditService.logDataChange(
        "user-123",
        "user",
        "user-456",
        {
            email: { old: "old@example.com", new: "new@example.com" },
        }
    );

    // Gerar relatório de compliance
    const report = await auditService.generateComplianceReport(
        new Date("2024-01-01"),
        new Date("2024-12-31")
    );

    return report;
}

// Uso com decorator
class UserService {
    @Auditable("user_created", "user")
    async createUser(data: any) {
        // Lógica de criação
        const user = await userRepository.create(data);
        return user;
        // Audit log criado automaticamente!
    }
}

// ============================================
// 8. Observability
// ============================================

import { logger, initWebVitals, useWebVitals } from "@/lib/observability";

// Structured Logging
function loggingExamples() {
    logger.debug("Debug message", { data: "..." });
    logger.info("User logged in", { userId: "123" });
    logger.warn("Rate limit approaching", { remaining: 10 });
    logger.error("API call failed", new Error("Network error"));
    logger.fatal("Database connection lost", new Error("Connection timeout"));

    // Performance log
    logger.performance("Heavy Operation", 1234, { items: 100 });

    // Audit log
    logger.audit("User deleted", { userId: "123", deletedBy: "admin" });
}

// Web Vitals
function WebVitalsExample() {
    const metrics = useWebVitals();

    React.useEffect(() => {
        initWebVitals();
    }, []);

    return (
        <div>
            {metrics.map((metric) => (
                <div key={metric.id}>
                    {metric.name}: {metric.value} ({metric.rating})
                </div>
            ))}
        </div>
    );
}

// ============================================
// 9. Performance
// ============================================

import {
    lazyWithRetry,
    memoListItem,
    VirtualList,
    useDebounce,
} from "@/lib/performance";

// Lazy loading
const HeavyComponent = lazyWithRetry(
    () => import("@/components/heavy"),
    3 // 3 tentativas
);

function LazyExample() {
    return (
        <React.Suspense fallback={<div>Loading...</div>}>
            <HeavyComponent />
        </React.Suspense>
    );
}

// Memoization
const UserCard = memoListItem(({ id, name }: any) => (
    <div>{name}</div>
));

// Virtual scrolling
function VirtualListExample() {
    const items = Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
    }));

    return (
        <VirtualList
            items={items}
            itemHeight={50}
            renderItem={(item) => <div>{item.name}</div>}
        />
    );
}

// Debounce
function SearchExample() {
    const [search, setSearch] = React.useState("");
    const debouncedSearch = useDebounce(search, 300);

    React.useEffect(() => {
        // Buscar apenas quando parar de digitar
        if (debouncedSearch) {
            searchProducts(debouncedSearch);
        }
    }, [debouncedSearch]);

    return (
        <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
        />
    );
}

// ============================================
// 10. TanStack Query
// ============================================

import { useUsers, useCreateUser, useDeleteUser } from "@/hooks/queries";

function TanStackQueryExample() {
    const { data: users, isLoading } = useUsers();
    const createUser = useCreateUser();
    const deleteUser = useDeleteUser();

    const handleCreate = async () => {
        await createUser.mutateAsync({
            email: "new@example.com",
            password: "password123",
            displayName: "New User",
        });
    };

    const handleDelete = async (userId: string) => {
        await deleteUser.mutateAsync(userId);
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <div>
            <button onClick={handleCreate}>Create User</button>
            {users?.map((user) => (
                <div key={user.userId}>
                    {user.displayName}
                    <button onClick={() => handleDelete(user.userId)}>Delete</button>
                </div>
            ))}
        </div>
    );
}

/**
 * RESUMO DE USO:
 * 
 * 1. RBAC/ABAC: <Can> component, useCan hook
 * 2. Events: eventBus.emit(), auto-handlers
 * 3. Repository: userRepository.findById()
 * 4. Strategy: AuthContext, notificationService
 * 5. LGPD: CookieConsentBanner, dataPortabilityService
 * 6. Audit: auditService.log(), @Auditable
 * 7. Observability: logger, initWebVitals()
 * 8. Performance: lazyWithRetry, VirtualList, useDebounce
 * 9. TanStack Query: useUsers(), useCreateUser()
 */

import { userRepository, productRepository, orderRepository } from "@/lib/repositories";

async function searchProducts(query: string) {
    return productRepository.search(query);
}
