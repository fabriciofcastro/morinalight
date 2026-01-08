/**
 * Security Analytics Dashboard
 * 
 * Comprehensive analytics dashboard with charts and metrics
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/base/card';
import { Button } from '@/shared/ui/base/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/base/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/base/tabs';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { Download, TrendingUp, TrendingDown, Shield, AlertTriangle, Users, Globe } from 'lucide-react';
import { format } from 'date-fns';

interface AnalyticsData {
    summary: {
        totalAlerts: number;
        criticalAlerts: number;
        highAlerts: number;
        blockedUsers: number;
        blockedIPs: number;
        uniqueUsers: number;
    };
    timeSeries: Array<{ date: string; count: number }>;
    typeDistribution: Record<string, number>;
    severityDistribution: Record<string, number>;
    geoDistribution: Record<string, number>;
    topUsers: Array<{
        email: string;
        displayName: string;
        count: number;
        critical: number;
    }>;
    trend: {
        current: number;
        previous: number;
        change: number;
        direction: 'up' | 'down';
    };
}

const SEVERITY_COLORS = {
    critical: '#dc2626',
    high: '#ea580c',
    medium: '#ca8a04',
    low: '#65a30d',
};

const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

export function SecurityAnalytics() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('30');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/security/analytics?days=${timeRange}`);
            if (!response.ok) {
                throw new Error('Failed to fetch analytics');
            }

            const analyticsData = await response.json();
            setData(analyticsData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = () => {
        if (!data) return;

        const csv = [
            ['Metric', 'Value'],
            ['Total Alerts', data.summary.totalAlerts],
            ['Critical Alerts', data.summary.criticalAlerts],
            ['High Alerts', data.summary.highAlerts],
            ['Blocked Users', data.summary.blockedUsers],
            ['Blocked IPs', data.summary.blockedIPs],
            ['Unique Users Affected', data.summary.uniqueUsers],
            [''],
            ['Date', 'Alerts'],
            ...data.timeSeries.map(d => [d.date, d.count]),
        ]
            .map(row => row.join(','))
            .join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `security-analytics-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading analytics...</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="text-center text-destructive">
                        <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
                        <p>{error || 'No data available'}</p>
                        <Button onClick={fetchAnalytics} className="mt-4">
                            Retry
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const typeChartData = Object.entries(data.typeDistribution).map(([name, value]) => ({
        name: name.replace(/_/g, ' '),
        value,
    }));

    const severityChartData = Object.entries(data.severityDistribution).map(([name, value]) => ({
        name,
        value,
        fill: SEVERITY_COLORS[name as keyof typeof SEVERITY_COLORS] || '#6b7280',
    }));

    const geoChartData = Object.entries(data.geoDistribution)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, value]) => ({ name, value }));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Security Analytics</h2>
                    <p className="text-muted-foreground">
                        Comprehensive security metrics and insights
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7">Last 7 days</SelectItem>
                            <SelectItem value="30">Last 30 days</SelectItem>
                            <SelectItem value="90">Last 90 days</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={exportToCSV} variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.summary.totalAlerts}</div>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                            {data.trend.direction === 'up' ? (
                                <TrendingUp className="h-3 w-3 mr-1 text-destructive" />
                            ) : (
                                <TrendingDown className="h-3 w-3 mr-1 text-green-600" />
                            )}
                            <span className={data.trend.direction === 'up' ? 'text-destructive' : 'text-green-600'}>
                                {Math.abs(data.trend.change).toFixed(1)}%
                            </span>
                            <span className="ml-1">vs previous period</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">
                            {data.summary.criticalAlerts}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {data.summary.highAlerts} high severity
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Blocked Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.summary.blockedUsers}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {data.summary.uniqueUsers} unique users affected
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Blocked IPs</CardTitle>
                        <Globe className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.summary.blockedIPs}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            From {Object.keys(data.geoDistribution).length} countries
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <Tabs defaultValue="timeline" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                    <TabsTrigger value="distribution">Distribution</TabsTrigger>
                    <TabsTrigger value="geography">Geography</TabsTrigger>
                    <TabsTrigger value="users">Top Users</TabsTrigger>
                </TabsList>

                <TabsContent value="timeline" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Alerts Over Time</CardTitle>
                            <CardDescription>Daily alert count for the selected period</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={350}>
                                <LineChart data={data.timeSeries}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                                    />
                                    <YAxis />
                                    <Tooltip
                                        labelFormatter={(value) => format(new Date(value as string), 'PPP')}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        name="Alerts"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="distribution" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Alert Types</CardTitle>
                                <CardDescription>Distribution by alert type</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={typeChartData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={(entry) => entry.name}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {typeChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Severity Levels</CardTitle>
                                <CardDescription>Distribution by severity</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={severityChartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="value" fill="#8884d8">
                                            {severityChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="geography" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Geographic Distribution</CardTitle>
                            <CardDescription>Top 10 countries by alert count</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart data={geoChartData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="name" type="category" width={100} />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#3b82f6" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="users" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Most Affected Users</CardTitle>
                            <CardDescription>Users with the most security alerts</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {data.topUsers.map((user, index) => (
                                    <div key={user.email} className="flex items-center justify-between border-b pb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="font-medium">{user.displayName || user.email}</p>
                                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">{user.count} alerts</p>
                                            {user.critical > 0 && (
                                                <p className="text-sm text-destructive">{user.critical} critical</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
