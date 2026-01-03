"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    Building2,
    ShieldCheck,
    UserCircle,
    Package,
    FileText,
    Truck,
    DollarSign,
    Bell,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronDown,
} from 'lucide-react';
import { authApi } from '@/lib/api/auth';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Usuários', href: '/users', icon: Users },
    { name: 'Estrutura Organizacional', href: '/structure', icon: Building2 },
    { name: 'Permissões', href: '/permissions', icon: ShieldCheck },
    { name: 'Clientes', href: '/clients', icon: UserCircle },
    { name: 'Representantes', href: '/representatives', icon: Users },
    { name: 'Comissões', href: '/commissions', icon: DollarSign },
    { name: 'Catálogo', href: '/catalog', icon: Package },
    { name: 'Pré-fichas', href: '/preficha', icon: FileText },
    { name: 'Fornecedores', href: '/suppliers', icon: Truck },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const user = authApi.getCurrentUser();

    const handleLogout = () => {
        authApi.logout();
    };

    return (
        <div className="flex h-screen overflow-hidden bg-[hsl(var(--background))]">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-[hsl(var(--border))] bg-[hsl(var(--surface))] transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex h-full flex-col">
                    {/* Logo */}
                    <div className="flex h-16 items-center justify-between border-b border-[hsl(var(--border))] px-6">
                        <Link href="/dashboard" className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] flex items-center justify-center">
                                <LayoutDashboard className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-lg font-bold text-[hsl(var(--text-1))]">Morina Light</span>
                        </Link>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden text-[hsl(var(--text-3))] hover:text-[hsl(var(--text-1))]"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto p-4">
                        <div className="space-y-1">
                            {navigation.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive
                                                ? 'bg-[hsl(var(--primary)_/_0.1)] text-[hsl(var(--primary))]'
                                                : 'text-[hsl(var(--text-2))] hover:bg-[hsl(var(--surface-hover))] hover:text-[hsl(var(--text-1))]'
                                            }`}
                                        onClick={() => setSidebarOpen(false)}
                                    >
                                        <item.icon className="h-5 w-5" />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </nav>

                    {/* Settings */}
                    <div className="border-t border-[hsl(var(--border))] p-4">
                        <Link
                            href="/settings"
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[hsl(var(--text-2))] transition-colors hover:bg-[hsl(var(--surface-hover))] hover:text-[hsl(var(--text-1))]"
                        >
                            <Settings className="h-5 w-5" />
                            Configurações
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Top bar */}
                <header className="flex h-16 items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-6">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden text-[hsl(var(--text-3))] hover:text-[hsl(var(--text-1))]"
                    >
                        <Menu className="h-6 w-6" />
                    </button>

                    <div className="flex items-center gap-4 ml-auto">
                        {/* Notifications */}
                        <button className="relative rounded-lg p-2 text-[hsl(var(--text-3))] hover:bg-[hsl(var(--surface-hover))] hover:text-[hsl(var(--text-1))]">
                            <Bell className="h-5 w-5" />
                            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
                        </button>

                        {/* User menu */}
                        <div className="relative">
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-[hsl(var(--surface-hover))]"
                            >
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] flex items-center justify-center text-sm font-semibold text-white">
                                    {user?.displayName?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div className="hidden text-left md:block">
                                    <p className="text-sm font-medium text-[hsl(var(--text-1))]">
                                        {user?.displayName || 'Usuário'}
                                    </p>
                                    <p className="text-xs text-[hsl(var(--text-3))]">{user?.email}</p>
                                </div>
                                <ChevronDown className="h-4 w-4 text-[hsl(var(--text-3))]" />
                            </button>

                            {userMenuOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setUserMenuOpen(false)}
                                    />
                                    <div className="absolute right-0 top-full z-20 mt-2 w-56 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-lg">
                                        <div className="p-2">
                                            <Link
                                                href="/profile"
                                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[hsl(var(--text-2))] hover:bg-[hsl(var(--surface-hover))] hover:text-[hsl(var(--text-1))]"
                                                onClick={() => setUserMenuOpen(false)}
                                            >
                                                <UserCircle className="h-4 w-4" />
                                                Meu perfil
                                            </Link>
                                            <Link
                                                href="/settings"
                                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[hsl(var(--text-2))] hover:bg-[hsl(var(--surface-hover))] hover:text-[hsl(var(--text-1))]"
                                                onClick={() => setUserMenuOpen(false)}
                                            >
                                                <Settings className="h-4 w-4" />
                                                Configurações
                                            </Link>
                                            <hr className="my-2 border-[hsl(var(--border))]" />
                                            <button
                                                onClick={handleLogout}
                                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                Sair
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
