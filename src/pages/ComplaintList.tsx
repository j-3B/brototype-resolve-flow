import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search } from 'lucide-react';
import { format } from 'date-fns';

interface Complaint {
  id: string;
  title: string;
  status: string;
  priority: string;
  created_at: string;
  student_id: string;
  profiles: {
    name: string;
  };
}

export default function ComplaintList() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    fetchComplaints();
  }, [profile]);

  const fetchComplaints = async () => {
    if (!profile) return;

    try {
      let query = supabase
        .from('complaints')
        .select(`
          *,
          profiles!student_id (name)
        `)
        .order('created_at', { ascending: false });

      // Students only see their own complaints
      if (profile.role === 'student') {
        query = query.eq('student_id', profile.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      setComplaints(data || []);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-warning text-warning-foreground';
      case 'in_progress': return 'bg-primary text-primary-foreground';
      case 'resolved': return 'bg-success text-success-foreground';
      case 'closed': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-warning text-warning-foreground';
      case 'medium': return 'bg-primary text-primary-foreground';
      case 'low': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || complaint.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

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
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Complaints</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search complaints..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              {filteredComplaints.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No complaints found
                </p>
              ) : (
                filteredComplaints.map((complaint) => (
                  <Link key={complaint.id} to={`/complaints/${complaint.id}`}>
                    <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex-1">
                          <h3 className="font-semibold">{complaint.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {profile?.role !== 'student' && `By ${complaint.profiles.name} • `}
                            {format(new Date(complaint.created_at), 'PPP')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(complaint.priority)}>
                            {complaint.priority}
                          </Badge>
                          <Badge className={getStatusColor(complaint.status)}>
                            {complaint.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}