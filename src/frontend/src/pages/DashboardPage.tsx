import { useGetOpenJobsByFirm, useGetOpenJobsByCategory, useGetUserJobsByStatus, useGetJobPostingTrend } from '../hooks/useAnalytics';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const CHART_COLORS = ['oklch(0.646 0.222 41.116)', 'oklch(0.6 0.118 184.704)', 'oklch(0.398 0.07 227.392)', 'oklch(0.828 0.189 84.429)', 'oklch(0.769 0.188 70.08)'];

export default function DashboardPage() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: jobsByFirm = [], isLoading: firmLoading } = useGetOpenJobsByFirm();
  const { data: jobsByCategory = [], isLoading: categoryLoading } = useGetOpenJobsByCategory();
  const { data: userJobsByStatus = [], isLoading: statusLoading } = useGetUserJobsByStatus();
  const { data: trendData, isLoading: trendLoading } = useGetJobPostingTrend();

  const firmChartData = jobsByFirm.map(([name, count]) => ({
    name,
    count: Number(count),
  }));

  const categoryChartData = jobsByCategory.map(([name, count]) => ({
    name,
    value: Number(count),
  }));

  const statusChartData = userJobsByStatus.map(([name, count]) => ({
    name,
    count: Number(count),
  }));

  const getTrendIcon = () => {
    if (!trendData) return null;
    if (trendData.trend === 'Increasing') return <TrendingUp className="h-5 w-5 text-green-600" />;
    if (trendData.trend === 'Decreasing') return <TrendingDown className="h-5 w-5 text-red-600" />;
    return <Minus className="h-5 w-5 text-muted-foreground" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Overview of job postings and your application progress</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Open Jobs by Firm</CardTitle>
          </CardHeader>
          <CardContent>
            {firmLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : firmChartData.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                No data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={firmChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--border))" />
                  <XAxis dataKey="name" tick={{ fill: 'oklch(var(--muted-foreground))' }} />
                  <YAxis tick={{ fill: 'oklch(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'oklch(var(--popover))',
                      border: '1px solid oklch(var(--border))',
                      borderRadius: '0.5rem',
                    }}
                  />
                  <Bar dataKey="count" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Open Jobs by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : categoryChartData.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                No data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'oklch(var(--popover))',
                      border: '1px solid oklch(var(--border))',
                      borderRadius: '0.5rem',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {isAuthenticated && (
          <Card>
            <CardHeader>
              <CardTitle>My Applications by Status</CardTitle>
            </CardHeader>
            <CardContent>
              {statusLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : statusChartData.length === 0 || statusChartData.every((d) => d.count === 0) ? (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  No saved jobs yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={statusChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--border))" />
                    <XAxis dataKey="name" tick={{ fill: 'oklch(var(--muted-foreground))' }} angle={-45} textAnchor="end" height={80} />
                    <YAxis tick={{ fill: 'oklch(var(--muted-foreground))' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'oklch(var(--popover))',
                        border: '1px solid oklch(var(--border))',
                        borderRadius: '0.5rem',
                      }}
                    />
                    <Bar dataKey="count" fill={CHART_COLORS[1]} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Job Posting Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {trendLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : !trendData ? (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                No data available
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-center gap-3 py-8">
                  {getTrendIcon()}
                  <span className="text-2xl font-bold">{trendData.trend}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-3xl font-bold">{Number(trendData.recentPostings)}</div>
                    <div className="text-sm text-muted-foreground mt-1">Recent (30 days)</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-3xl font-bold">{Number(trendData.olderPostings)}</div>
                    <div className="text-sm text-muted-foreground mt-1">Older</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
