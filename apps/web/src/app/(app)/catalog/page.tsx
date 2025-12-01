"use client";

import { useState, useEffect } from 'react';
import { Plus, Search, Package, Grid, List } from 'lucide-react';
import { Button, Input, GlassCard } from '@morina/ui';
import { catalogApi, type Product } from '@/lib/api/catalog';
import { PageBackground } from '@/components/page-background';

export default function CatalogPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const data = await catalogApi.listProducts();
            setProducts(data);
        } catch (error) {
            console.error('Failed to load products:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredProducts = products.filter(
        (product) =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.categoryName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <PageBackground variant="catalogo" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-[hsl(var(--text-1))]">Catálogo</h1>
                        <p className="mt-2 text-[hsl(var(--text-2))]">Gerencie produtos e categorias</p>
                    </div>
                    <Button className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Novo produto
                    </Button>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[hsl(var(--text-3))]" />
                        <Input
                            type="search"
                            placeholder="Buscar produtos..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant={viewMode === 'grid' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setViewMode('grid')}
                        >
                            <Grid className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === 'list' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setViewMode('list')}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[hsl(var(--primary))] border-t-transparent" />
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-12 text-center">
                        <Package className="mx-auto h-12 w-12 text-[hsl(var(--text-3))]" />
                        <h3 className="mt-4 text-lg font-semibold text-[hsl(var(--text-1))]">Nenhum produto encontrado</h3>
                        <p className="mt-2 text-sm text-[hsl(var(--text-3))]">Comece adicionando produtos ao catálogo</p>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredProducts.map((product) => (
                            <GlassCard key={product.productId} className="overflow-hidden">
                                <div className="aspect-square bg-gradient-to-br from-[hsl(var(--primary)_/_0.1)] to-[hsl(var(--secondary)_/_0.1)] flex items-center justify-center">
                                    <Package className="h-16 w-16 text-[hsl(var(--text-3))]" />
                                </div>
                                <div className="p-4">
                                    <div className="mb-2 flex items-start justify-between">
                                        <h3 className="font-semibold text-[hsl(var(--text-1))]">{product.name}</h3>
                                        <span
                                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${product.status === 'active'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                                                }`}
                                        >
                                            {product.status === 'active' ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-[hsl(var(--text-3))]">SKU: {product.sku}</p>
                                    {product.categoryName && (
                                        <p className="mt-1 text-sm text-[hsl(var(--text-3))]">{product.categoryName}</p>
                                    )}
                                    <p className="mt-3 text-lg font-bold text-[hsl(var(--primary))]">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                                    </p>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))]">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b border-[hsl(var(--border))] bg-[hsl(var(--surface-hover))]">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-[hsl(var(--text-1))]">Produto</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-[hsl(var(--text-1))]">SKU</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-[hsl(var(--text-1))]">Categoria</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-[hsl(var(--text-1))]">Preço</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-[hsl(var(--text-1))]">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[hsl(var(--border))]">
                                    {filteredProducts.map((product) => (
                                        <tr key={product.productId} className="hover:bg-[hsl(var(--surface-hover))]">
                                            <td className="px-6 py-4 font-medium text-[hsl(var(--text-1))]">{product.name}</td>
                                            <td className="px-6 py-4 text-sm text-[hsl(var(--text-2))]">{product.sku}</td>
                                            <td className="px-6 py-4 text-sm text-[hsl(var(--text-2))]">{product.categoryName || '-'}</td>
                                            <td className="px-6 py-4 font-semibold text-[hsl(var(--primary))]">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${product.status === 'active'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                                                        }`}
                                                >
                                                    {product.status === 'active' ? 'Ativo' : 'Inativo'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
