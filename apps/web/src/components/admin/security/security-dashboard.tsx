'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/base/card';
import { Badge } from '@/shared/ui/base/badge';
import { Button } from '@/shared/ui/base/button';
import { Alert } from '@/shared/ui/base/Alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/base/tabs';
import {
    Shield,
    AlertTriangle,
    Activity,
    Clock,
    CheckCircle,
    XCircle,
    TrendingUp,
    Users,
    Loader2,
    MapPin,
    Globe,
    Terminal
} from 'lucide-react';
import { format } from 'date-fns';
import { AllowedGuard } from "@/components/auth/allowed-guard";

interface SecurityAlert {
    id: string;
    userId: string;
    alertType: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    metadata: any;
    acknowledged: boolean;
    acknowledgedAt: string | null;
    acknowledgedBy: string | null;
    ipAddress: string | null;
    country: string | null;
    city: string | null;
    latitude: number | null;
    longitude: number | null;
    createdAt: string;
    user: {
        id: string;
        email: string;
        displayName: string | null;
    };
}

interface SecurityStats {
    totalAlerts: number;
    unacknowledgedAlerts: number;
    alertsBySeverity: Array<{ severity: string; count: number }>;
    alertsByType: Array<{ type: string; count: number }>;
    criticalAlerts: SecurityAlert[];
    timeline: Array<{ date: string; count: number }>;
    mfaAdoptionRate: number;
    totalUsers: number;
}

export function SecurityDashboard() {
    const [stats, setStats] = useState<SecurityStats | null>(null);
    const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [acknowledging, setAcknowledging] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [statsRes, alertsRes] = await Promise.all([
                fetch('/api/security/alerts/stats?days=7'),
                fetch('/api/security/alerts?limit=50'),
            ]);

            if (!statsRes.ok || !alertsRes.ok) {
                throw new Error('Failed to fetch security data');
            }

            const statsData = await statsRes.json();
            const alertsData = await alertsRes.json();

            setStats(statsData);
            setAlerts(alertsData.alerts);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleAcknowledge = async (alertId: string) => {
        try {
            setAcknowledging(alertId);

            const response = await fetch(`/api/security/alerts/${alertId}/acknowledge`, {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('Failed to acknowledge alert');
            }

            // Refresh data
            await fetchData();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to acknowledge alert');
        } finally {
            setAcknowledging(null);
        }
    };

    const handleBlockUser = async (userId: string, minutes: number) => {
        try {
            setAcknowledging(userId); // Reuse state for loading indicator

            const response = await fetch('/api/security/block-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, minutes, reason: 'Blocked from Security Dashboard' }),
            });

            if (!response.ok) {
                throw new Error('Failed to block user');
            }

            // Refresh data
            await fetchData();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to block user');
        } finally {
            setAcknowledging(null);
        }
    };

    const handleBlockIP = async (ip: string, minutes: number) => {
        try {
            setAcknowledging(ip); // Reuse state for loading indicator

            const response = await fetch('/api/security/block-ip', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ip, minutes, reason: 'Blocked from Security Dashboard' }),
            });

            if (!response.ok) {
                throw new Error('Failed to block IP');
            }

            // Refresh data
            await fetchData();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to block IP');
        } finally {
            setAcknowledging(null);
        }
    };

    const handleUnblockUser = async (userId: string) => {
        try {
            setAcknowledging(userId);

            const response = await fetch('/api/security/block-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, minutes: 0, reason: 'Unblocked from Security Dashboard' }),
            });

            if (!response.ok) {
                throw new Error('Failed to unblock user');
            }

            await fetchData();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to unblock user');
        } finally {
            setAcknowledging(null);
        }
    };

    const handleUnblockIP = async (ip: string) => {
        try {
            setAcknowledging(ip);

            const response = await fetch('/api/security/block-ip', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ip, minutes: 0, reason: 'Unblocked from Security Dashboard' }),
            });

            if (!response.ok) {
                throw new Error('Failed to unblock IP');
            }

            await fetchData();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to unblock IP');
        } finally {
            setAcknowledging(null);
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical':
                return 'danger';
            case 'high':
                return 'danger';
            case 'medium':
                return 'default';
            case 'low':
                return 'secondary';
            default:
                return 'default';
        }
    };

    const getAlertTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            multiple_failed_logins: 'Multiple Failed Logins',
            multiple_ips: 'Multiple IP Addresses',
            unusual_time: 'Unusual Access Time',
            privilege_escalation: 'Privilege Escalation',
            abnormal_volume: 'Abnormal Activity Volume',
        };
        return labels[type] || type;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error) {
        return (
            <Alert
                type="error"
                title="Security Dashboard Error"
                message={error}
                icon={<AlertTriangle className="h-4 w-4" />}
            />
        );
    }

    if (!stats) {
        return null;
    }

    return (
        <AllowedGuard I="read" a="Settings" redirectTo="/admin">
            <div className="space-y-6">
                {/* MFA Recommendation Banner for Admins */}
                {stats.mfaAdoptionRate < 100 && (
                    <Alert
                        type="warning"
                        title="Segurança de Conta Recomendada"
                        message="Identificamos que nem todos os administradores possuem MFA ativo. Proteja sua conta para cumprir os requisitos SOC2."
                        icon={<Shield className="h-4 w-4 text-amber-500" />}
                    />
                )}
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <Shield className="h-8 w-8" />
                            Security Dashboard
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Monitor and manage security alerts and threats
                        </p>
                    </div>
                    <Button onClick={fetchData} variant="outline">
                        <Activity className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalAlerts}</div>
                            <p className="text-xs text-muted-foreground">Last 7 days</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Unacknowledged</CardTitle>
                            <XCircle className="h-4 w-4 text-destructive" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.unacknowledgedAlerts}</div>
                            <p className="text-xs text-muted-foreground">Requires attention</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
                            <Shield className="h-4 w-4 text-destructive" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.alertsBySeverity.find(s => s.severity === 'critical')?.count || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">High priority</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">MFA Adoption</CardTitle>
                            <CheckCircle className={`h-4 w-4 ${stats.mfaAdoptionRate > 80 ? 'text-green-500' : 'text-amber-500'}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.mfaAdoptionRate.toFixed(1)}%</div>
                            <p className="text-xs text-muted-foreground">{stats.totalUsers} total users</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="alerts" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="alerts">All Alerts</TabsTrigger>
                        <TabsTrigger value="critical">Critical</TabsTrigger>
                        <TabsTrigger value="stats">Statistics</TabsTrigger>
                    </TabsList>

                    <TabsContent value="alerts" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Security Alerts</CardTitle>
                                <CardDescription>
                                    All security alerts from the last 7 days
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {alerts.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                                            <p>No security alerts found</p>
                                        </div>
                                    ) : (
                                        alerts.map((alert) => (
                                            <div
                                                key={alert.id}
                                                className="flex items-start justify-between p-4 border rounded-lg"
                                            >
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant={getSeverityColor(alert.severity)}>
                                                            {alert.severity.toUpperCase()}
                                                        </Badge>
                                                        <span className="font-medium">
                                                            {getAlertTypeLabel(alert.alertType)}
                                                        </span>
                                                        {alert.acknowledged && (
                                                            <Badge variant="outline" className="text-green-600">
                                                                <CheckCircle className="mr-1 h-3 w-3" />
                                                                Acknowledged
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        {alert.description}
                                                    </p>
                                                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            <Users className="h-3 w-3" />
                                                            {alert.user.displayName || alert.user.email}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {format(new Date(alert.createdAt), 'PPp')}
                                                        </span>
                                                        {alert.ipAddress && (
                                                            <span className="flex items-center gap-1 font-mono">
                                                                <Terminal className="h-3 w-3" />
                                                                {alert.ipAddress}
                                                            </span>
                                                        )}
                                                        {(alert.city || alert.country) && (
                                                            <span className="flex items-center gap-1">
                                                                <MapPin className="h-3 w-3" />
                                                                {alert.city}{alert.city && alert.country ? ', ' : ''}{alert.country}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    {!alert.acknowledged && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleAcknowledge(alert.id)}
                                                            disabled={acknowledging === alert.id}
                                                        >
                                                            {acknowledging === alert.id ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                'Acknowledge'
                                                            )}
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        variant="danger"
                                                        onClick={() => handleBlockUser(alert.userId, 60)}
                                                        disabled={acknowledging === alert.id}
                                                    >
                                                        Block User (1h)
                                                    </Button>
                                                    {alert.metadata && (alert.metadata as any).ip && (
                                                        <Button
                                                            size="sm"
                                                            variant="danger"
                                                            onClick={() => handleBlockIP((alert.metadata as any).ip, 60)}
                                                            disabled={acknowledging === alert.id}
                                                        >
                                                            Block IP (1h)
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="critical" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Critical Alerts</CardTitle>
                                <CardDescription>
                                    High-priority security incidents requiring immediate attention
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {stats.criticalAlerts.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                                            <p>No critical alerts</p>
                                        </div>
                                    ) : (
                                        stats.criticalAlerts.map((alert) => (
                                            <div
                                                key={alert.id}
                                                className="flex items-start justify-between p-4 border border-destructive rounded-lg bg-destructive/5"
                                            >
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="danger">CRITICAL</Badge>
                                                        <span className="font-medium">
                                                            {getAlertTypeLabel(alert.alertType)}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        {alert.description}
                                                    </p>
                                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            <Users className="h-3 w-3" />
                                                            {alert.user.displayName || alert.user.email}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {format(new Date(alert.createdAt), 'PPp')}
                                                        </span>
                                                    </div>
                                                </div>
                                                {!alert.acknowledged && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleAcknowledge(alert.id)}
                                                        disabled={acknowledging === alert.id}
                                                    >
                                                        {acknowledging === alert.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            'Acknowledge'
                                                        )}
                                                    </Button>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="stats" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Alerts by Severity</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {stats.alertsBySeverity.map((item) => (
                                            <div key={item.severity} className="flex items-center justify-between">
                                                <Badge variant={getSeverityColor(item.severity)}>
                                                    {item.severity.toUpperCase()}
                                                </Badge>
                                                <span className="font-medium">{item.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Alerts by Type</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {stats.alertsByType.map((item) => (
                                            <div key={item.type} className="flex items-center justify-between">
                                                <span className="text-sm">{getAlertTypeLabel(item.type)}</span>
                                                <span className="font-medium">{item.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AllowedGuard>
    );
}
