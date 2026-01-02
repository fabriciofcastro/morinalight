/**
 * Lazy Loading Routes - Examples
 * 
 * Exemplos de como aplicar lazy loading em rotas
 */

import { lazy, Suspense } from "react";
import { lazyWithRetry, DefaultLoadingFallback } from "@/lib/performance";

// ===== EXEMPLO 1: Dashboard (Admin) =====

// Lazy load com retry automático
const AdminDashboard = lazyWithRetry(
    () => import("@/components/admin/dashboard"),
    3 // 3 tentativas
);

export function AdminDashboardPage() {
    return (
        <Suspense fallback={<DefaultLoadingFallback />}>
            <AdminDashboard />
        </Suspense>
    );
}

// ===== EXEMPLO 2: Reports =====

const ReportsPage = lazyWithRetry(
    () => import("@/components/reports/reports-page"),
    3
);

export function Reports() {
    return (
        <Suspense fallback={<DefaultLoadingFallback />}>
            <ReportsPage />
        </Suspense>
    );
}

// ===== EXEMPLO 3: User Management =====

const UserManagement = lazyWithRetry(
    () => import("@/components/admin/users/user-management"),
    3
);

export function UsersPage() {
    return (
        <Suspense fallback={<DefaultLoadingFallback />}>
            <UserManagement />
        </Suspense>
    );
}

// ===== EXEMPLO 4: Products =====

const ProductsPage = lazyWithRetry(
    () => import("@/components/products/products-page"),
    3
);

export function Products() {
    return (
        <Suspense fallback={<DefaultLoadingFallback />}>
            <ProductsPage />
        </Suspense>
    );
}

// ===== EXEMPLO 5: Settings =====

const SettingsPage = lazyWithRetry(
    () => import("@/components/settings/settings-page"),
    3
);

export function Settings() {
    return (
        <Suspense fallback={<DefaultLoadingFallback />}>
            <SettingsPage />
        </Suspense>
    );
}

/**
 * IMPLEMENTADO ✅
 * 
 * Lazy loading aplicado em rotas principais:
 * - Dashboard
 * - Reports
 * - User Management
 * - Products
 * - Settings
 * 
 * Benefícios:
 * - Bundle inicial reduzido
 * - Carregamento sob demanda
 * - Retry automático em caso de falha
 * - Melhor First Load performance
 */
