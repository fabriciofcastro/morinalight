"use client";

import { useEffect, useState } from "react";
import {
    Building2,
    TrendingUp,
    Activity,
    DollarSign,
    MapPin,
    AlertCircle,
    CheckCircle,
    Clock
} from "lucide-react";
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";
import { organizationalStructureApi, type Branch } from "@/lib/api/organizational-structure";
import { AnimatedNetworkBackground } from "@/components/ui/animated-network-background";
import { useRouter } from "next/navigation";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { exportBranchesReport } from "@/lib/reports";
import { notificationCenter } from "@/components/notifications/notification-center";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function BranchesDashboardPage() {
    const router = useRouter();
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBranches();
    }, []);

    const loadBranches = async () => {
        try {
            const data = await organizationalStructureApi.getBranches();
            setBranches(data);
        } catch (error) {
            console.error("Erro ao carregar filiais:", error);
        } finally {
            setLoading(false);
        }
    };

    // Estatísticas
    const stats = {
        total: branches.length,
        active: branches.filter(b => b.active).length,
        inactive: branches.filter(b => !b.active).length,
        byType: branches.reduce((acc, b) => {
            const type = b.type || "OUTROS";
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>),
    };

    const growthRate = "+12.5"; // Mock - seria calculado de dados reais

    // Dados para gráficos
    const typeChartData = Object.entries(stats.byType).map(([name, value]) => ({
        name,
        value,
    }));

    const monthlyData = [
        { month: "Jan", branches: 15, active: 14 },
        { month: "Fev", branches: 16, active: 15 },
        { month: "Mar", branches: 18, active: 17 },
        { month: "Abr", branches: 19, active: 18 },
        { month: "Mai", branches: 21, active: 20 },
        { month: "Jun", branches: stats.total, active: stats.active },
    ];

    if (loading) {
        return (
            <AnimatedNetworkBackground>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
                </div>
            </AnimatedNetworkBackground>
        );
    }

    return (
        <AnimatedNetworkBackground className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Dashboard de Filiais</h1>
                        <p className="text-white/60">Visão geral e analytics em tempo real</p>
                    </div>
                    <div className="flex gap-2">
                        <div className="flex bg-white/5 rounded-lg border border-white/10 p-1">
                            <button
                                onClick={() => {
                                    try {
                                        exportBranchesReport(branches, "pdf");
                                        notificationCenter.add({
                                            title: "Download Iniciado",
                                            message: "Seu relatório PDF está sendo gerado.",
                                            type: "success"
                                        });
                                    } catch (e) {
                                        console.error(e);
                                    }
                                }}
                                className="p-2 hover:bg-white/10 rounded text-white/70 hover:text-white transition-colors"
                                title="Exportar PDF"
                            >
                                <FileText className="w-5 h-5" />
                            </button>
                            <div className="w-px bg-white/10 mx-1 my-1" />
                            <button
                                onClick={() => {
                                    try {
                                        exportBranchesReport(branches, "excel");
                                        notificationCenter.add({
                                            title: "Download Iniciado",
                                            message: "Seu relatório Excel está sendo gerado.",
                                            type: "success"
                                        });
                                    } catch (e) {
                                        console.error(e);
                                    }
                                }}
                                className="p-2 hover:bg-white/10 rounded text-white/70 hover:text-white transition-colors"
                                title="Exportar Excel"
                            >
                                <FileSpreadsheet className="w-5 h-5" />
                            </button>
                        </div>

                        <button
                            onClick={() => router.push("/admin/branches")}
                            className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors flex items-center gap-2"
                        >
                            Ver Todas
                        </button>
                    </div>
                </div>
                {/* Cards de Estatísticas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Total */}
                    <div className="p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-blue-400" />
                            </div>
                            <span className="text-sm text-green-400 flex items-center gap-1">
                                <TrendingUp className="w-4 h-4" />
                                {growthRate}%
                            </span>
                        </div>
                        <p className="text-3xl font-bold text-white mb-1">{stats.total}</p>
                        <p className="text-sm text-white/60">Total de Filiais</p>
                    </div>

                    {/* Ativas */}
                    <div className="p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                                <Activity className="w-6 h-6 text-green-400" />
                            </div>
                            <CheckCircle className="w-5 h-5 text-green-400" />
                        </div>
                        <p className="text-3xl font-bold text-white mb-1">{stats.active}</p>
                        <p className="text-sm text-white/60">Filiais Ativas</p>
                    </div>

                    {/* Inativas */}
                    <div className="p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                                <AlertCircle className="w-6 h-6 text-red-400" />
                            </div>
                            <Clock className="w-5 h-5 text-red-400" />
                        </div>
                        <p className="text-3xl font-bold text-white mb-1">{stats.inactive}</p>
                        <p className="text-sm text-white/60">Filiais Inativas</p>
                    </div>

                    {/* Taxa de Utilização */}
                    <div className="p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-purple-400" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-white mb-1">
                            {((stats.active / stats.total) * 100).toFixed(1)}%
                        </p>
                        <p className="text-sm text-white/60">Taxa de Ativação</p>
                    </div>
                </div>

                {/* Gráficos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Gráfico de Pizza - Distribuição por Tipo */}
                    <div className="p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                        <h3 className="text-lg font-semibold text-white mb-4">Distribuição por Tipo</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={typeChartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {typeChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "rgba(0,0,0,0.8)",
                                        border: "1px solid rgba(255,255,255,0.1)",
                                        borderRadius: "8px"
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Gráfico de Linhas - Evolução */}
                    <div className="p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                        <h3 className="text-lg font-semibold text-white mb-4">Evolução nos Últimos 6 Meses</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
                                <YAxis stroke="rgba(255,255,255,0.5)" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "rgba(0,0,0,0.8)",
                                        border: "1px solid rgba(255,255,255,0.1)",
                                        borderRadius: "8px"
                                    }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="branches"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    name="Total"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="active"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    name="Ativas"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Lista de Filiais Recentes */}
                <div className="p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                    <h3 className="text-lg font-semibold text-white mb-4">Filiais Recentes</h3>
                    <div className="space-y-2">
                        {branches.slice(0, 5).map((branch) => (
                            <div
                                key={branch.id}
                                onClick={() => router.push(`/admin/branches/${branch.id}`)}
                                className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-pointer border border-transparent hover:border-white/10"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${branch.active ? "bg-green-500/20" : "bg-gray-500/20"
                                        }`}>
                                        <Building2 className={`w-5 h-5 ${branch.active ? "text-green-400" : "text-gray-400"
                                            }`} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">{branch.name}</p>
                                        <p className="text-sm text-white/60">{branch.code} • {branch.type}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {branch.address?.city && (
                                        <div className="flex items-center gap-1 text-sm text-white/60">
                                            <MapPin className="w-4 h-4" />
                                            {branch.address.city}, {branch.address.state}
                                        </div>
                                    )}
                                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${branch.active
                                        ? "bg-green-500/20 text-green-400"
                                        : "bg-gray-500/20 text-gray-400"
                                        }`}>
                                        {branch.active ? "Ativa" : "Inativa"}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AnimatedNetworkBackground>
    );
}
