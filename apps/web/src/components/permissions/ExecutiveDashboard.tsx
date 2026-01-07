"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Activity,
    AlertTriangle,
    Download,
    Shield,
    TrendingDown,
    TrendingUp,
    Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

interface ExecutiveKPIs {
    overallConformityScore: number;
    securityTrend: 'improving' | 'stable' | 'declining';
    criticalIssues: number;
    highRiskUsers: number;
    totalUsers: number;
    sodViolations: number;
    anomaliesTrend: number[];
    conformityTrend: number[];
}

interface DepartmentComparison {
    department: string;
    conformityScore: number;
    anomaliesCount: number;
    userCount: number;
    trend: 'up' | 'down' | 'stable';
}

export function ExecutiveDashboard({ orgId }: { orgId: string }) {
    const [kpis, setKpis] = useState<ExecutiveKPIs | null>(null);
    const [departments, setDepartments] = useState<DepartmentComparison[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [orgId]);

    const loadData = async () => {
        try {
            setLoading(true);

            const [kpisRes, deptsRes] = await Promise.all([
                fetch(`/api/permissions/executive/kpis?orgId=${orgId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                }),
                fetch(`/api/permissions/executive/departments?orgId=${orgId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                }),
            ]);

            const kpisData = await kpisRes.json();
            const deptsData = await deptsRes.json();

            setKpis(kpisData);
            setDepartments(deptsData);
        } catch (error) {
            console.error('Error loading executive data:', error);
        } finally {
            setLoading(false);
        }
    };

    const exportToPowerBI = async () => {
        try {
            const response = await fetch(`/api/permissions/executive/export?format=powerbi&orgId=${orgId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'executive-report-powerbi.json';
            a.click();
        } catch (error) {
            console.error('Error exporting to PowerBI:', error);
        }
    };

    if (loading || !kpis) {
        return <div className="p-8">Loading executive dashboard...</div>;
    }

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'improving':
            case 'up':
                return <TrendingUp className="h-4 w-4 text-green-600" />;
            case 'declining':
            case 'down':
                return <TrendingDown className="h-4 w-4 text-red-600" />;
            default:
                return <Activity className="h-4 w-4 text-gray-600" />;
        }
    };

    const getTrendColor = (trend: string) => {
        switch (trend) {
            case 'improving':
            case 'up':
                return 'text-green-600';
            case 'declining':
            case 'down':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    // Preparar dados para gráficos
    const conformityTrendData = kpis.conformityTrend.map((score, index) => ({
        day: `Day ${index + 1}`,
        score,
    }));

    const anomaliesTrendData = kpis.anomaliesTrend.map((count, index) => ({
        day: `Day ${index + 1}`,
        anomalies: count,
    }));

    const departmentChartData = departments.map(d => ({
        name: d.department,
        conformity: d.conformityScore,
        anomalies: d.anomaliesCount,
    }));

    const riskDistribution = [
        { name: 'Low Risk', value: kpis.totalUsers - kpis.highRiskUsers - kpis.criticalIssues },
        { name: 'High Risk', value: kpis.highRiskUsers },
        { name: 'Critical', value: kpis.criticalIssues },
    ];

    const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Executive Dashboard</h1>
                    <p className="text-muted-foreground">High-level security and compliance overview</p>
                </div>
                <Button onClick={exportToPowerBI} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export to PowerBI
                </Button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Overall Conformity</CardTitle>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{kpis.overallConformityScore}%</div>
                        <div className={`flex items-center text-xs ${getTrendColor(kpis.securityTrend)}`}>
                            {getTrendIcon(kpis.securityTrend)}
                            <span className="ml-1 capitalize">{kpis.securityTrend}</span>
                        </div>
                        <Progress value={kpis.overallConformityScore} className="mt-2" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{kpis.criticalIssues}</div>
                        <p className="text-xs text-muted-foreground">Require immediate attention</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">High Risk Users</CardTitle>
                        <Users className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{kpis.highRiskUsers}</div>
                        <p className="text-xs text-muted-foreground">
                            {((kpis.highRiskUsers / kpis.totalUsers) * 100).toFixed(1)}% of total users
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">SoD Violations</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{kpis.sodViolations}</div>
                        <p className="text-xs text-muted-foreground">Segregation of duties conflicts</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <Tabs defaultValue="trends" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="trends">Trends</TabsTrigger>
                    <TabsTrigger value="departments">Departments</TabsTrigger>
                    <TabsTrigger value="risk">Risk Distribution</TabsTrigger>
                </TabsList>

                <TabsContent value="trends" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Conformity Trend (30 days)</CardTitle>
                                <CardDescription>Security posture over time</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={conformityTrendData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="day" />
                                        <YAxis domain={[0, 100]} />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Anomalies Trend (30 days)</CardTitle>
                                <CardDescription>Detected anomalies over time</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={anomaliesTrendData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="day" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="anomalies" fill="#ef4444" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="departments">
                    <Card>
                        <CardHeader>
                            <CardTitle>Department Comparison</CardTitle>
                            <CardDescription>Conformity scores and anomalies by department</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={departmentChartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis yAxisId="left" />
                                    <YAxis yAxisId="right" orientation="right" />
                                    <Tooltip />
                                    <Legend />
                                    <Bar yAxisId="left" dataKey="conformity" fill="#10b981" name="Conformity %" />
                                    <Bar yAxisId="right" dataKey="anomalies" fill="#ef4444" name="Anomalies" />
                                </BarChart>
                            </ResponsiveContainer>

                            <div className="mt-4 space-y-2">
                                {departments.map((dept) => (
                                    <div key={dept.department} className="flex items-center justify-between p-2 border rounded">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{dept.department}</span>
                                            {getTrendIcon(dept.trend)}
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Badge variant={dept.conformityScore >= 80 ? 'default' : 'danger'}>
                                                {dept.conformityScore}% conformity
                                            </Badge>
                                            <span className="text-sm text-muted-foreground">{dept.userCount} users</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="risk">
                    <Card>
                        <CardHeader>
                            <CardTitle>Risk Distribution</CardTitle>
                            <CardDescription>User risk levels across organization</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={400}>
                                <PieChart>
                                    <Pie
                                        data={riskDistribution}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                                        outerRadius={120}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {riskDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
