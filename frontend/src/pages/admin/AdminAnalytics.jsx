import React, { useState, useEffect, useCallback } from 'react';
import {
    Activity,
    Eye,
    FileText,
    Globe,
    Users,
    TrendingUp,
    RefreshCw,
    Loader2,
    AlertCircle,
    Wifi,
    WifiOff,
    ArrowUpRight,
    CalendarCheck,
    PartyPopper,
    Percent,
    Clock,
    ExternalLink,
    BarChart3,
    Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

// --- Constants ---
const POLL_INTERVAL_MS = 30 * 1000; // 30 seconds
const API_ENDPOINT = '/api/admin/analytics';

// --- Stat Card Component ---
function StatCard({ title, value, subtitle, icon: Icon, color, pulse, loading }) {
    return (
        <Card className="bg-[color:var(--bg-surface)] border-white/10 overflow-hidden relative group hover:border-white/20 transition-all duration-300">
            {/* Glow effect on hover */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${color?.replace('text-', 'bg-')?.split(' ')[0]}/5 blur-xl`} />

            <CardContent className="p-5 relative z-10">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wider text-[color:var(--text-muted)] mb-1">
                            {title}
                        </p>
                        {loading ? (
                            <div className="h-9 flex items-center">
                                <Loader2 className="w-5 h-5 text-[color:var(--text-muted)] animate-spin" />
                            </div>
                        ) : (
                            <p className="font-display text-3xl font-bold text-white tabular-nums">
                                {value}
                            </p>
                        )}
                        {subtitle && (
                            <p className="text-xs text-[color:var(--text-muted)] mt-1 truncate">
                                {subtitle}
                            </p>
                        )}
                    </div>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color || 'bg-white/10 text-white'}`}>
                        {pulse ? (
                            <div className="relative">
                                <Icon className="w-5 h-5" />
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" />
                            </div>
                        ) : (
                            <Icon className="w-5 h-5" />
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// --- Top Pages Table ---
function TopPagesTable({ pages, loading }) {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 text-[color:var(--text-muted)] animate-spin" />
            </div>
        );
    }

    if (!pages || pages.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-[color:var(--text-muted)]">
                <FileText className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-sm">No page data available</p>
            </div>
        );
    }

    const maxViews = Math.max(...pages.map(p => p.views));

    return (
        <div className="space-y-2">
            {pages.map((page, index) => {
                // Extract path from full URL
                let displayPath = page.page;
                try {
                    const url = new URL(page.page);
                    displayPath = url.pathname || '/';
                } catch {
                    displayPath = page.page;
                }

                const barWidth = maxViews > 0 ? (page.views / maxViews) * 100 : 0;

                return (
                    <div
                        key={index}
                        className="group relative flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-white/5 hover:border-white/10 transition-all duration-200"
                    >
                        {/* Rank */}
                        <span className="text-xs font-mono text-[color:var(--text-muted)] w-5 text-right shrink-0">
                            {index + 1}
                        </span>

                        {/* Progress bar background */}
                        <div className="flex-1 min-w-0 relative">
                            <div
                                className="absolute inset-y-0 left-0 bg-[color:var(--brand-accent)]/10 rounded"
                                style={{ width: `${barWidth}%` }}
                            />
                            <span className="relative text-sm text-[color:var(--text-secondary)] font-mono truncate block px-2 py-0.5">
                                {displayPath}
                            </span>
                        </div>

                        {/* Views count */}
                        <span className="text-sm font-semibold text-white tabular-nums shrink-0">
                            {page.views}
                        </span>
                        <Eye className="w-3.5 h-3.5 text-[color:var(--text-muted)] shrink-0" />
                    </div>
                );
            })}
        </div>
    );
}

// --- Top Referrers Table ---
function TopReferrersTable({ referrers, loading }) {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 text-[color:var(--text-muted)] animate-spin" />
            </div>
        );
    }

    if (!referrers || referrers.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-[color:var(--text-muted)]">
                <Globe className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-sm">No referrer data available</p>
            </div>
        );
    }

    const maxVisitors = Math.max(...referrers.map(r => r.visitors));

    // Color map for common sources
    const sourceColors = {
        '(direct)': 'bg-blue-500/20 text-blue-400',
        'instagram.com': 'bg-pink-500/20 text-pink-400',
        'facebook.com': 'bg-indigo-500/20 text-indigo-400',
        'google.com': 'bg-green-500/20 text-green-400',
        'tiktok.com': 'bg-purple-500/20 text-purple-400',
        'twitter.com': 'bg-sky-500/20 text-sky-400',
        'youtube.com': 'bg-red-500/20 text-red-400',
    };

    return (
        <div className="space-y-2">
            {referrers.map((ref, index) => {
                const barWidth = maxVisitors > 0 ? (ref.visitors / maxVisitors) * 100 : 0;
                const colorClass = sourceColors[ref.source] || 'bg-gray-500/20 text-gray-400';

                return (
                    <div
                        key={index}
                        className="group relative flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-white/5 hover:border-white/10 transition-all duration-200"
                    >
                        {/* Source badge */}
                        <span className={`text-xs font-medium px-2 py-1 rounded-md shrink-0 ${colorClass}`}>
                            {ref.source === '(direct)' ? '⚡ Direct' : ref.source}
                        </span>

                        {/* Bar */}
                        <div className="flex-1 min-w-0 relative h-2 bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="absolute inset-y-0 left-0 bg-[color:var(--brand-accent)]/40 rounded-full transition-all duration-700"
                                style={{ width: `${barWidth}%` }}
                            />
                        </div>

                        {/* Visitors count */}
                        <span className="text-sm font-semibold text-white tabular-nums shrink-0">
                            {ref.visitors}
                        </span>
                        <Users className="w-3.5 h-3.5 text-[color:var(--text-muted)] shrink-0" />
                    </div>
                );
            })}
        </div>
    );
}

// --- Status Badge ---
function StatusBadge({ configured, label }) {
    return (
        <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${configured
                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}>
            {configured ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {label}: {configured ? 'Connected' : 'Not configured'}
        </span>
    );
}

// --- Main Component ---
export default function AdminAnalytics() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchAnalytics = useCallback(async (showRefreshState = false) => {
        if (showRefreshState) setIsRefreshing(true);

        try {
            const response = await fetch(API_ENDPOINT);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (result.success) {
                setData(result.data);
                setLastUpdated(new Date());
                setError(null);
            } else {
                throw new Error(result.error || 'Unknown error');
            }
        } catch (err) {
            console.error('Failed to fetch analytics:', err);
            setError(err.message);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    // Polling
    useEffect(() => {
        const interval = setInterval(() => {
            fetchAnalytics(false);
        }, POLL_INTERVAL_MS);

        return () => clearInterval(interval);
    }, [fetchAnalytics]);

    // Format time ago
    const timeAgo = lastUpdated
        ? `${Math.round((Date.now() - lastUpdated.getTime()) / 1000)}s ago`
        : 'never';

    return (
        <div className="space-y-6 StaggerChildren">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[color:var(--brand-accent)]/10 flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-[color:var(--brand-accent)]" />
                        </div>
                        <div>
                            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
                                Live Analytics
                            </h1>
                            <p className="text-sm text-[color:var(--text-muted)]">
                                Real-time overview · Auto-refreshes every 30s
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Status badges */}
                    <div className="hidden md:flex items-center gap-2">
                        {data && (
                            <>
                                <StatusBadge configured={data.posthogConfigured} label="PostHog" />
                                <StatusBadge configured={data.supabaseConfigured} label="Supabase" />
                            </>
                        )}
                    </div>

                    {/* Last updated */}
                    <div className="flex items-center gap-1.5 text-xs text-[color:var(--text-muted)]">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Updated {timeAgo}</span>
                    </div>

                    {/* Refresh button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchAnalytics(true)}
                        disabled={isRefreshing}
                        className="border-white/10 text-[color:var(--text-secondary)] hover:border-white/20 hover:bg-white/5"
                    >
                        <RefreshCw className={`w-4 h-4 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Error banner */}
            {error && (
                <Card className="bg-red-500/10 border-red-500/20">
                    <CardContent className="p-4 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-red-400">Failed to load analytics</p>
                            <p className="text-xs text-red-400/70">{error}</p>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => fetchAnalytics(true)}
                            className="ml-auto text-red-400 hover:bg-red-500/10"
                        >
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Dev mode notice */}
            {data?._devMock && (
                <Card className="bg-amber-500/10 border-amber-500/20">
                    <CardContent className="p-4 flex items-center gap-3">
                        <Zap className="w-5 h-5 text-amber-400 shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-amber-400">Development Mode</p>
                            <p className="text-xs text-amber-400/70">
                                Showing mock data. Set POSTHOG_PERSONAL_API_KEY and SUPABASE_SERVICE_ROLE_KEY env vars for real analytics.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {/* A) Online Now */}
                <StatCard
                    title="Online Now"
                    value={data?.onlineNow ?? '—'}
                    subtitle="Active in last 5 min"
                    icon={Activity}
                    color="bg-green-500/10 text-green-400"
                    pulse={data?.onlineNow > 0}
                    loading={loading}
                />

                {/* B) Visits Today */}
                <StatCard
                    title="Visits Today"
                    value={data?.visitsToday ?? '—'}
                    subtitle="Unique visitors"
                    icon={Eye}
                    color="bg-blue-500/10 text-blue-400"
                    loading={loading}
                />

                {/* C) Bookings Today */}
                <StatCard
                    title="Bookings Today"
                    value={data?.leadsToday?.bookings ?? '—'}
                    subtitle="From booking flow"
                    icon={CalendarCheck}
                    color="bg-[color:var(--brand-accent)]/10 text-[color:var(--brand-accent)]"
                    loading={loading}
                />

                {/* D) Event Leads Today */}
                <StatCard
                    title="Event Leads"
                    value={data?.leadsToday?.eventLeads ?? '—'}
                    subtitle="Birthday, Corporate, School"
                    icon={PartyPopper}
                    color="bg-purple-500/10 text-purple-400"
                    loading={loading}
                />

                {/* E) Total Leads */}
                <StatCard
                    title="Total Leads"
                    value={data?.leadsToday?.total ?? '—'}
                    subtitle="Bookings + Events"
                    icon={TrendingUp}
                    color="bg-orange-500/10 text-orange-400"
                    loading={loading}
                />

                {/* F) Conversion Rate */}
                <StatCard
                    title="Conversion Rate"
                    value={data?.conversionRate != null ? `${data.conversionRate}%` : '—'}
                    subtitle="Leads / Visits today"
                    icon={Percent}
                    color="bg-emerald-500/10 text-emerald-400"
                    loading={loading}
                />
            </div>

            {/* Detailed Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Pages */}
                <Card className="bg-[color:var(--bg-surface)] border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                <FileText className="w-4 h-4 text-blue-400" />
                            </div>
                            <div>
                                <CardTitle className="text-white text-base">Top Pages</CardTitle>
                                <p className="text-xs text-[color:var(--text-muted)]">Last 30 minutes</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <TopPagesTable pages={data?.topPages} loading={loading} />
                    </CardContent>
                </Card>

                {/* Top Referrers */}
                <Card className="bg-[color:var(--bg-surface)] border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                                <Globe className="w-4 h-4 text-indigo-400" />
                            </div>
                            <div>
                                <CardTitle className="text-white text-base">Traffic Sources</CardTitle>
                                <p className="text-xs text-[color:var(--text-muted)]">Today's referrers & UTM sources</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <TopReferrersTable referrers={data?.topReferrers} loading={loading} />
                    </CardContent>
                </Card>
            </div>

            {/* Mobile status badges */}
            <div className="flex md:hidden flex-wrap items-center gap-2">
                {data && (
                    <>
                        <StatusBadge configured={data.posthogConfigured} label="PostHog" />
                        <StatusBadge configured={data.supabaseConfigured} label="Supabase" />
                    </>
                )}
            </div>

            {/* Footer info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-[color:var(--text-muted)] border-t border-white/5 pt-4">
                <p>
                    Analytics powered by PostHog · Leads from Supabase · No PII displayed
                </p>
                <div className="flex items-center gap-4">
                    <a
                        href="https://us.posthog.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 hover:text-white transition-colors"
                    >
                        PostHog Dashboard <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
            </div>
        </div>
    );
}
