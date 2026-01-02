"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
    Shield,
    Database,
    Zap,
    Lock,
    FileCode,
    Workflow,
    Palette,
    AlertTriangle,
    Cloud,
    GitBranch,
    Boxes,
    Cpu
} from "lucide-react";
import { GlassCard } from "@morina/ui";
import { AnimatedTechCorners } from "@/components/ui/animated-tech-corners";
import { HexagonGrid } from "@/components/login/hexagon-grid";

interface ArchitectureLayer {
    id: string;
    name: string;
    icon: React.ElementType;
    description: string;
    status: "implemented" | "partial" | "planned";
    components: {
        name: string;
        description: string;
        tech: string[];
        status: "live" | "beta" | "planned";
    }[];
    benefits: string[];
}

const architectureLayers: ArchitectureLayer[] = [
    {
        id: "security",
        name: "Camada de Segurança",
        icon: Shield,
        description: "Segurança enterprise-grade em todas as camadas",
        status: "implemented",
        components: [
            {
                name: "RBAC com CASL",
                description: "Controle de acesso baseado em roles com abilities dinâmicas",
                tech: ["CASL", "TypeScript", "React Context"],
                status: "live"
            },
            {
                name: "Autenticação Multi-Fator",
                description: "MFA opcional com TOTP e backup codes",
                tech: ["Firebase Auth", "OTP", "QR Code"],
                status: "live"
            },
            {
                name: "Session Management",
                description: "Gerenciamento seguro de sessões com revogação",
                tech: ["JWT", "Redis", "Refresh Tokens"],
                status: "live"
            },
            {
                name: "Rate Limiting",
                description: "Proteção contra ataques de força bruta",
                tech: ["Redis", "Token Bucket", "IP Tracking"],
                status: "beta"
            },
            {
                name: "Encryption at Rest",
                description: "Dados sensíveis criptografados no banco",
                tech: ["AES-256", "KMS", "Field-level encryption"],
                status: "planned"
            }
        ],
        benefits: [
            "Compliance com LGPD, ISO 27001, SOC 2",
            "Zero-trust architecture",
            "Auditoria completa de acessos",
            "Proteção contra OWASP Top 10"
        ]
    },
    {
        id: "data",
        name: "Camada de Dados",
        icon: Database,
        description: "Persistência escalável e performática",
        status: "partial",
        components: [
            {
                name: "PostgreSQL",
                description: "Banco relacional principal com Prisma ORM",
                tech: ["PostgreSQL 15", "Prisma", "Connection Pooling"],
                status: "live"
            },
            {
                name: "Firebase Data Connect",
                description: "GraphQL otimizado com Cloud SQL",
                tech: ["GraphQL", "Cloud SQL", "Generated SDKs"],
                status: "beta"
            },
            {
                name: "Redis Cache",
                description: "Cache distribuído para performance",
                tech: ["Redis", "Cache-aside", "TTL"],
                status: "live"
            },
            {
                name: "Event Sourcing",
                description: "Histórico completo de eventos do sistema",
                tech: ["PostgreSQL", "Event Store", "CQRS"],
                status: "beta"
            },
            {
                name: "Real-time Sync",
                description: "Sincronização em tempo real entre clientes",
                tech: ["WebSockets", "Firebase Realtime", "Optimistic UI"],
                status: "planned"
            }
        ],
        benefits: [
            "Queries otimizadas com índices",
            "Backup automático e point-in-time recovery",
            "Escalabilidade horizontal",
            "Type-safety end-to-end"
        ]
    },
    {
        id: "design-system",
        name: "Design System",
        icon: Palette,
        description: "Sistema de design futurístico e consistente",
        status: "implemented",
        components: [
            {
                name: "Futuristic Components",
                description: "Biblioteca de componentes com animações premium",
                tech: ["React", "Framer Motion", "Tailwind CSS"],
                status: "live"
            },
            {
                name: "Design Tokens",
                description: "Tokens de design para consistência visual",
                tech: ["CSS Variables", "Theme System", "Dark Mode"],
                status: "live"
            },
            {
                name: "Animation Library",
                description: "Animações reutilizáveis e performáticas",
                tech: ["Framer Motion", "CSS Animations", "GPU Acceleration"],
                status: "live"
            },
            {
                name: "Glassmorphism",
                description: "Efeitos de vidro e blur para UI moderna",
                tech: ["CSS Backdrop Filter", "Gradients", "Shadows"],
                status: "live"
            },
            {
                name: "Accessibility",
                description: "WCAG 2.1 AA compliance",
                tech: ["ARIA", "Keyboard Navigation", "Screen Reader"],
                status: "live"
            }
        ],
        benefits: [
            "Desenvolvimento 3x mais rápido",
            "Consistência em toda aplicação",
            "Experiência premium",
            "Acessível para todos"
        ]
    },
    {
        id: "error-handling",
        name: "Error Handling",
        icon: AlertTriangle,
        description: "Tratamento avançado de erros e resiliência",
        status: "implemented",
        components: [
            {
                name: "Error Boundaries",
                description: "Captura de erros React com fallbacks",
                tech: ["React Error Boundary", "Sentry", "Fallback UI"],
                status: "live"
            },
            {
                name: "Error Parser",
                description: "Categorização inteligente de erros",
                tech: ["TypeScript", "Error Codes", "i18n"],
                status: "live"
            },
            {
                name: "Telemetry",
                description: "Monitoramento e alertas em tempo real",
                tech: ["Sentry", "Custom Metrics", "Alerts"],
                status: "live"
            },
            {
                name: "Auto-Recovery",
                description: "Recuperação automática de falhas",
                tech: ["Retry Logic", "Circuit Breaker", "Fallbacks"],
                status: "beta"
            },
            {
                name: "User Feedback",
                description: "Mensagens amigáveis e acionáveis",
                tech: ["Toast Notifications", "Error Pages", "Help Links"],
                status: "live"
            }
        ],
        benefits: [
            "Debugging eficiente",
            "Melhor experiência do usuário",
            "Redução de downtime",
            "Insights de problemas"
        ]
    },
    {
        id: "cicd",
        name: "CI/CD Pipeline",
        icon: GitBranch,
        description: "Entrega contínua com qualidade garantida",
        status: "implemented",
        components: [
            {
                name: "GitHub Actions",
                description: "Automação de build, test e deploy",
                tech: ["GitHub Actions", "Docker", "Workflows"],
                status: "live"
            },
            {
                name: "Quality Gates",
                description: "Validações automáticas de código",
                tech: ["ESLint", "Prettier", "TypeScript", "Tests"],
                status: "live"
            },
            {
                name: "Automated Testing",
                description: "Testes unitários, integração e E2E",
                tech: ["Vitest", "Testing Library", "Playwright"],
                status: "live"
            },
            {
                name: "Preview Deployments",
                description: "Ambientes de preview por PR",
                tech: ["Vercel", "Docker", "Ephemeral Envs"],
                status: "beta"
            },
            {
                name: "Rollback Strategy",
                description: "Reversão rápida em caso de problemas",
                tech: ["Git Tags", "Docker Images", "Database Migrations"],
                status: "live"
            }
        ],
        benefits: [
            "Deploy em minutos",
            "Zero-downtime deployments",
            "Qualidade garantida",
            "Feedback rápido"
        ]
    },
    {
        id: "performance",
        name: "Performance",
        icon: Zap,
        description: "Otimizações para velocidade máxima",
        status: "partial",
        components: [
            {
                name: "Code Splitting",
                description: "Carregamento lazy de componentes",
                tech: ["Next.js", "Dynamic Imports", "Route-based"],
                status: "live"
            },
            {
                name: "Image Optimization",
                description: "Imagens otimizadas automaticamente",
                tech: ["Next.js Image", "WebP", "Responsive"],
                status: "live"
            },
            {
                name: "Caching Strategy",
                description: "Cache em múltiplas camadas",
                tech: ["Redis", "CDN", "Browser Cache", "SWR"],
                status: "live"
            },
            {
                name: "Bundle Optimization",
                description: "Bundles mínimos e tree-shaking",
                tech: ["Turbopack", "Tree Shaking", "Minification"],
                status: "beta"
            },
            {
                name: "Edge Computing",
                description: "Processamento próximo ao usuário",
                tech: ["Vercel Edge", "Edge Functions", "CDN"],
                status: "planned"
            }
        ],
        benefits: [
            "Lighthouse score > 90",
            "FCP < 1.5s",
            "TTI < 3s",
            "Experiência fluida"
        ]
    },
    {
        id: "monitoring",
        name: "Observability",
        icon: Cpu,
        description: "Monitoramento e métricas em tempo real",
        status: "partial",
        components: [
            {
                name: "Sentry Integration",
                description: "Error tracking e performance monitoring",
                tech: ["Sentry", "Source Maps", "Release Tracking"],
                status: "live"
            },
            {
                name: "Custom Metrics",
                description: "Métricas de negócio customizadas",
                tech: ["StatsD", "Prometheus", "Grafana"],
                status: "planned"
            },
            {
                name: "Logging",
                description: "Logs estruturados e centralizados",
                tech: ["Winston", "Structured Logs", "Log Aggregation"],
                status: "beta"
            },
            {
                name: "Alerting",
                description: "Alertas automáticos de problemas",
                tech: ["PagerDuty", "Slack", "Email"],
                status: "planned"
            },
            {
                name: "Tracing",
                description: "Rastreamento distribuído de requests",
                tech: ["OpenTelemetry", "Jaeger", "Trace Context"],
                status: "planned"
            }
        ],
        benefits: [
            "Detecção proativa de problemas",
            "Debugging distribuído",
            "SLA monitoring",
            "Capacity planning"
        ]
    },
    {
        id: "infrastructure",
        name: "Infraestrutura",
        icon: Cloud,
        description: "Cloud-native e escalável",
        status: "partial",
        components: [
            {
                name: "Containerization",
                description: "Aplicação containerizada com Docker",
                tech: ["Docker", "Docker Compose", "Multi-stage"],
                status: "live"
            },
            {
                name: "Orchestration",
                description: "Gerenciamento de containers",
                tech: ["Kubernetes", "Helm", "Auto-scaling"],
                status: "planned"
            },
            {
                name: "Load Balancing",
                description: "Distribuição de carga",
                tech: ["Nginx", "HAProxy", "Health Checks"],
                status: "beta"
            },
            {
                name: "Service Mesh",
                description: "Comunicação entre serviços",
                tech: ["Istio", "Envoy", "mTLS"],
                status: "planned"
            },
            {
                name: "IaC",
                description: "Infrastructure as Code",
                tech: ["Terraform", "Ansible", "GitOps"],
                status: "planned"
            }
        ],
        benefits: [
            "Escalabilidade automática",
            "Alta disponibilidade",
            "Disaster recovery",
            "Multi-region ready"
        ]
    }
];

const statusConfig = {
    live: { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", label: "LIVE" },
    beta: { color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30", label: "BETA" },
    planned: { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", label: "PLANNED" }
};

const layerStatusConfig = {
    implemented: { color: "text-emerald-400", label: "100% Implementado" },
    partial: { color: "text-blue-400", label: "Parcialmente Implementado" },
    planned: { color: "text-amber-400", label: "Planejado" }
};

export function PlaybookArchitecture() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section ref={ref} className="relative py-32 px-6 overflow-hidden">
            {/* Hexagon Background */}
            <div className="absolute inset-0 opacity-10">
                <HexagonGrid />
            </div>

            {/* Grid Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />

            <div className="relative z-10 max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 mb-4">
                        <Boxes className="w-5 h-5 text-[hsl(var(--primary))]" />
                        <span className="text-[10px] font-mono text-[hsl(var(--primary))] tracking-[0.3em] uppercase">
                            SYSTEM_ARCHITECTURE
                        </span>
                    </div>

                    <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-black tracking-tight mb-6">
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-white to-white/60">
                            Arquitetura
                        </span>
                        <br />
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))]">
                            Enterprise-Grade
                        </span>
                    </h2>

                    <p className="text-lg text-white/60 max-w-2xl mx-auto">
                        Sistema construído para escalar. Cada camada projetada para performance, segurança e manutenibilidade.
                    </p>
                </motion.div>

                {/* Architecture Layers */}
                <div className="space-y-8">
                    {architectureLayers.map((layer, layerIndex) => {
                        const Icon = layer.icon;
                        const layerConfig = layerStatusConfig[layer.status];

                        return (
                            <motion.div
                                key={layer.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.6, delay: layerIndex * 0.1 }}
                            >
                                <GlassCard className="p-8">
                                    <AnimatedTechCorners variant="gradient" />

                                    {/* Layer Header */}
                                    <div className="flex items-start gap-6 mb-6">
                                        <div className="flex-shrink-0 w-16 h-16 border border-[hsl(var(--primary))]/30 bg-[hsl(var(--primary))]/10 flex items-center justify-center">
                                            <Icon className="w-8 h-8 text-[hsl(var(--primary))]" />
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-2xl font-bold text-white">{layer.name}</h3>
                                                <span className={`text-xs font-mono ${layerConfig.color} uppercase tracking-wider`}>
                                                    {layerConfig.label}
                                                </span>
                                            </div>
                                            <p className="text-white/60">{layer.description}</p>
                                        </div>
                                    </div>

                                    {/* Components Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                        {layer.components.map((component, i) => {
                                            const compConfig = statusConfig[component.status];

                                            return (
                                                <div
                                                    key={i}
                                                    className="border border-white/10 bg-white/5 p-4 hover:bg-white/10 hover:border-[hsl(var(--primary))]/30 transition-all duration-300 group"
                                                >
                                                    <div className="flex items-start justify-between mb-2">
                                                        <h4 className="font-semibold text-white group-hover:text-[hsl(var(--primary))] transition-colors">
                                                            {component.name}
                                                        </h4>
                                                        <span className={`text-[10px] font-mono ${compConfig.color} px-2 py-1 border ${compConfig.border} ${compConfig.bg}`}>
                                                            {compConfig.label}
                                                        </span>
                                                    </div>

                                                    <p className="text-sm text-white/60 mb-3">
                                                        {component.description}
                                                    </p>

                                                    <div className="flex flex-wrap gap-1">
                                                        {component.tech.map((tech, j) => (
                                                            <span
                                                                key={j}
                                                                className="text-[10px] px-2 py-1 bg-white/5 text-white/50 font-mono"
                                                            >
                                                                {tech}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Benefits */}
                                    <div className="border-t border-white/10 pt-4">
                                        <div className="text-xs font-mono text-white/40 uppercase tracking-wider mb-3">
                                            Benefícios
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {layer.benefits.map((benefit, i) => (
                                                <div key={i} className="flex items-center gap-2 text-sm text-white/70">
                                                    <div className="w-1 h-1 bg-[hsl(var(--primary))]" />
                                                    {benefit}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
