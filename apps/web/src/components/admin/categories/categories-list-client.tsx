"use client";

import { Button, cn } from "@morina/ui";
import { motion } from "framer-motion";
import {
    Tag,
    Search,
    Package,
    Layers
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useMemo } from "react";
import { catalogApi, Category } from "@/lib/api/catalog";
import { notificationCenter } from "@/components/notifications/notification-center";
import { PageBackground } from "@/components/layout/PageBackground";

const CategoryCard = ({ category }: { category: Category }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group relative bg-[#090b16]/60 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden hover:border-pink-500/30 transition-all duration-300"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="p-5 relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center border border-white/10 shadow-lg bg-pink-500/10 text-pink-400">
                        <Tag className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-lg leading-tight">{category.name}</h3>
                        <span className="text-xs font-mono text-white/40 bg-white/5 px-1.5 py-0.5 rounded mt-1 inline-block">
                            {category.slug}
                        </span>
                    </div>
                </div>
                <p className="text-sm text-white/40 line-clamp-2 mb-4 h-10">
                    {category.description || "Sem descrição."}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2 text-xs text-white/60">
                        <Package className="w-3 h-3" />
                        <span>{category.productCount} produtos</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export function CategoriesListClient() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const loadCategories = useCallback(async () => {
        try {
            setLoading(true);
            const data = await catalogApi.listCategories();
            setCategories(data);
        } catch (error) {
            notificationCenter.add({ type: "error", title: "Erro", message: "Erro ao carregar categorias." });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    const filtered = useMemo(() => {
        return categories.filter(c =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.slug.toLowerCase().includes(search.toLowerCase())
        );
    }, [categories, search]);

    return (
        <div className="p-8 space-y-8 min-h-screen text-white pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-200 to-pink-500">
                        Categorias de Produtos
                    </h1>
                    <p className="text-white/60 mt-1">Catálogo geral de categorias (Modo Leitura)</p>
                </div>
                <div className="bg-pink-500/10 border border-pink-500/20 px-3 py-1 rounded text-xs text-pink-400 font-mono">
                    READ ONLY
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex gap-4 bg-[#090b16]/40 p-4 rounded-xl border border-white/5 backdrop-blur-md">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input
                            type="text"
                            placeholder="Buscar categoria..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder:text-white/20 focus:outline-none focus:border-pink-500/50 transition-all"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-white/40">Carregando categorias...</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 text-white/40 border border-white/5 border-dashed rounded-xl">Nenhuma categoria encontrada.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filtered.map(cat => (
                            <CategoryCard key={cat.categoryId} category={cat} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
