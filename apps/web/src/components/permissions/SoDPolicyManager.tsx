"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Trash2, AlertTriangle, CheckCircle, Play } from "lucide-react";

interface SoDPolicy {
    id: string;
    name: string;
    description: string;
    conflictingPermissions: string[][];
    severity: "low" | "medium" | "high" | "critical";
    active: boolean;
}

interface SoDViolation {
    policyId: string;
    policyName: string;
    userId: string;
    userEmail: string;
    conflictingPermissions: string[];
    severity: string;
}

export function SoDPolicyManager() {
    const [policies, setPolicies] = useState<SoDPolicy[]>([]);
    const [violations, setViolations] = useState<SoDViolation[]>([]);
    const [loading, setLoading] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);

    // Formulário de nova política
    const [newPolicy, setNewPolicy] = useState({
        name: "",
        description: "",
        severity: "medium" as const,
        conflictingPermissions: [["", ""]],
    });

    useEffect(() => {
        fetchPolicies();
        fetchViolations();
    }, []);

    const fetchPolicies = async () => {
        try {
            const response = await fetch("/api/permissions/sod/policies", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            const data = await response.json();
            setPolicies(data.policies || []);
        } catch (error) {
            console.error("Erro ao buscar políticas:", error);
        }
    };

    const fetchViolations = async () => {
        try {
            const response = await fetch("/api/permissions/sod/violations", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            const data = await response.json();
            setViolations(data.violations || []);
        } catch (error) {
            console.error("Erro ao buscar violações:", error);
        }
    };

    const createPolicy = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/permissions/sod/policies", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(newPolicy),
            });

            if (response.ok) {
                alert("Política criada com sucesso!");
                setShowCreateForm(false);
                setNewPolicy({
                    name: "",
                    description: "",
                    severity: "medium",
                    conflictingPermissions: [["", ""]],
                });
                fetchPolicies();
            }
        } catch (error) {
            console.error("Erro ao criar política:", error);
            alert("Erro ao criar política");
        } finally {
            setLoading(false);
        }
    };

    const deletePolicy = async (policyId: string) => {
        if (!confirm("Tem certeza que deseja deletar esta política?")) {
            return;
        }

        try {
            const response = await fetch(`/api/permissions/sod/policies/${policyId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (response.ok) {
                alert("Política deletada com sucesso!");
                fetchPolicies();
            }
        } catch (error) {
            console.error("Erro ao deletar política:", error);
        }
    };

    const togglePolicy = async (policyId: string, active: boolean) => {
        try {
            const response = await fetch(`/api/permissions/sod/policies/${policyId}/toggle`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ active }),
            });

            if (response.ok) {
                fetchPolicies();
                fetchViolations();
            }
        } catch (error) {
            console.error("Erro ao alternar política:", error);
        }
    };

    const simulatePolicy = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/permissions/sod/simulate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    conflictingPermissions: newPolicy.conflictingPermissions,
                }),
            });

            const data = await response.json();
            alert(
                `Simulação: ${data.affectedUsers} usuários afetados, ${data.violations.length} violações detectadas`
            );
        } catch (error) {
            console.error("Erro ao simular política:", error);
        } finally {
            setLoading(false);
        }
    };

    const addConflictPair = () => {
        setNewPolicy({
            ...newPolicy,
            conflictingPermissions: [...newPolicy.conflictingPermissions, ["", ""]],
        });
    };

    const removeConflictPair = (index: number) => {
        const updated = newPolicy.conflictingPermissions.filter((_, i) => i !== index);
        setNewPolicy({ ...newPolicy, conflictingPermissions: updated });
    };

    const updateConflictPair = (index: number, pairIndex: number, value: string) => {
        const updated = [...newPolicy.conflictingPermissions];
        updated[index][pairIndex] = value;
        setNewPolicy({ ...newPolicy, conflictingPermissions: updated });
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case "critical":
                return "bg-red-600";
            case "high":
                return "bg-orange-600";
            case "medium":
                return "bg-yellow-600";
            default:
                return "bg-gray-600";
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Políticas de Segregação de Funções (SoD)</h2>
                    <p className="text-muted-foreground">
                        Gerencie políticas para prevenir conflitos de permissões
                    </p>
                </div>
                <Button onClick={() => setShowCreateForm(!showCreateForm)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Política
                </Button>
            </div>

            {/* Violações Ativas */}
            {violations.length > 0 && (
                <Alert className="border-red-600">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        <strong>{violations.length} violações ativas detectadas!</strong>
                        <div className="mt-2 space-y-1">
                            {violations.slice(0, 3).map((v, i) => (
                                <div key={i} className="text-sm">
                                    • {v.userEmail}: {v.policyName}
                                </div>
                            ))}
                            {violations.length > 3 && (
                                <div className="text-sm text-muted-foreground">
                                    + {violations.length - 3} mais...
                                </div>
                            )}
                        </div>
                    </AlertDescription>
                </Alert>
            )}

            {/* Formulário de Criação */}
            {showCreateForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>Criar Nova Política SoD</CardTitle>
                        <CardDescription>
                            Defina permissões conflitantes que não devem ser atribuídas ao mesmo usuário
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="name">Nome da Política</Label>
                            <Input
                                id="name"
                                value={newPolicy.name}
                                onChange={(e) => setNewPolicy({ ...newPolicy, name: e.target.value })}
                                placeholder="Ex: Segregação Financeira - Pagamentos"
                            />
                        </div>

                        <div>
                            <Label htmlFor="description">Descrição</Label>
                            <Textarea
                                id="description"
                                value={newPolicy.description}
                                onChange={(e) => setNewPolicy({ ...newPolicy, description: e.target.value })}
                                placeholder="Descreva o propósito desta política..."
                            />
                        </div>

                        <div>
                            <Label htmlFor="severity">Severidade</Label>
                            <Select
                                value={newPolicy.severity}
                                onValueChange={(value: any) => setNewPolicy({ ...newPolicy, severity: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Baixa</SelectItem>
                                    <SelectItem value="medium">Média</SelectItem>
                                    <SelectItem value="high">Alta</SelectItem>
                                    <SelectItem value="critical">Crítica</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Permissões Conflitantes</Label>
                            <div className="space-y-2 mt-2">
                                {newPolicy.conflictingPermissions.map((pair, index) => (
                                    <div key={index} className="flex gap-2 items-center">
                                        <Input
                                            placeholder="Permissão 1"
                                            value={pair[0]}
                                            onChange={(e) => updateConflictPair(index, 0, e.target.value)}
                                        />
                                        <span className="text-muted-foreground">+</span>
                                        <Input
                                            placeholder="Permissão 2"
                                            value={pair[1]}
                                            onChange={(e) => updateConflictPair(index, 1, e.target.value)}
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeConflictPair(index)}
                                            disabled={newPolicy.conflictingPermissions.length === 1}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <Button variant="outline" size="sm" onClick={addConflictPair} className="mt-2">
                                <Plus className="mr-2 h-4 w-4" />
                                Adicionar Par
                            </Button>
                        </div>

                        <div className="flex gap-2">
                            <Button onClick={createPolicy} disabled={loading}>
                                Criar Política
                            </Button>
                            <Button variant="outline" onClick={simulatePolicy} disabled={loading}>
                                <Play className="mr-2 h-4 w-4" />
                                Simular
                            </Button>
                            <Button variant="ghost" onClick={() => setShowCreateForm(false)}>
                                Cancelar
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Lista de Políticas */}
            <div className="grid gap-4">
                {policies.map((policy) => (
                    <Card key={policy.id}>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        {policy.name}
                                        <Badge className={getSeverityColor(policy.severity)}>
                                            {policy.severity}
                                        </Badge>
                                        {policy.active ? (
                                            <Badge className="bg-green-600">
                                                <CheckCircle className="mr-1 h-3 w-3" />
                                                Ativa
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline">Inativa</Badge>
                                        )}
                                    </CardTitle>
                                    <CardDescription>{policy.description}</CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => togglePolicy(policy.id, !policy.active)}
                                    >
                                        {policy.active ? "Desativar" : "Ativar"}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deletePolicy(policy.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <p className="text-sm font-medium">Permissões Conflitantes:</p>
                                {policy.conflictingPermissions.map((pair, index) => (
                                    <div key={index} className="flex items-center gap-2 text-sm">
                                        <code className="bg-muted px-2 py-1 rounded">{pair[0]}</code>
                                        <span className="text-muted-foreground">+</span>
                                        <code className="bg-muted px-2 py-1 rounded">{pair[1]}</code>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {policies.length === 0 && !showCreateForm && (
                <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                        Nenhuma política SoD configurada. Clique em "Nova Política" para começar.
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
