import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ComplaintStats {
  open: number;
  in_progress: number;
  resolved: number;
  closed: number;
}

export default function ComplaintOverview() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [stats, setStats] = useState<ComplaintStats>({ open: 0, in_progress: 0, resolved: 0, closed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [profile]);

  const fetchStats = async () => {
    if (!profile) return;

    try {
      let query = supabase
        .from('complaints')
        .select('status', { count: 'exact' });

      // Students only see their own complaints
      if (profile.role === 'student') {
        query = query.eq('student_id', profile.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      const stats = {
        open: data?.filter(c => c.status === 'open').length || 0,
        in_progress: data?.filter(c => c.status === 'in_progress').length || 0,
        resolved: data?.filter(c => c.status === 'resolved').length || 0,
        closed: data?.filter(c => c.status === 'closed').length || 0
      };

      setStats(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = [
    { name: 'Open', value: stats.open },
    { name: 'In Progress', value: stats.in_progress },
    { name: 'Resolved', value: stats.resolved },
  ];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent to-muted">
      <nav className="border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between p-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Brototype Complaints
          </h1>
        </div>
      </nav>

      <main className="container mx-auto p-6 space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>

        <h2 className="text-3xl font-bold">Complaints Overview</h2>

        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </main>
    </div>
  );
}
