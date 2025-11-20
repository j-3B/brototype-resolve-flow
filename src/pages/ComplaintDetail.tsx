import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Send, Download, FileIcon } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Complaint {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  student_id: string;
  assigned_to?: string;
  resolution_notes?: string;
  profiles: {
    name: string;
    email: string;
  };
}

interface Message {
  id: string;
  message: string;
  created_at: string;
  sender_id: string;
  profiles: {
    name: string;
  };
}

interface Attachment {
  id: string;
  file_path: string;
  original_name: string;
  file_size: number;
  uploaded_at: string;
}

export default function ComplaintDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (id) {
      fetchComplaint();
      fetchMessages();
      fetchAttachments();
      subscribeToMessages();
    }
  }, [id]);

  const fetchComplaint = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('complaints')
        .select(`
          *,
          profiles!student_id (name, email)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setComplaint(data);
    } catch (error) {
      console.error('Error fetching complaint:', error);
      toast.error('Failed to load complaint');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('complaint_messages')
        .select(`
          *,
          profiles!sender_id (name)
        `)
        .eq('complaint_id', id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchAttachments = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('complaint_attachments')
        .select('*')
        .eq('complaint_id', id)
        .order('uploaded_at', { ascending: true });

      if (error) throw error;
      setAttachments(data || []);
    } catch (error) {
      console.error('Error fetching attachments:', error);
    }
  };

  const downloadAttachment = async (attachment: Attachment) => {
    try {
      const { data, error } = await supabase.storage
        .from('complaint-attachments')
        .download(attachment.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.original_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('File downloaded successfully');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  const subscribeToMessages = () => {
    if (!id) return;

    const channel = supabase
      .channel(`complaints:${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'complaint_messages',
          filter: `complaint_id=eq.${id}`
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !profile || !id) return;

    setSending(true);

    try {
      const { error } = await supabase
        .from('complaint_messages')
        .insert({
          complaint_id: id,
          sender_id: profile.id,
          message: newMessage
        });

      if (error) throw error;

      setNewMessage('');
      toast.success('Message sent');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!id || !profile || profile.role === 'student') return;

    try {
      const { error } = await supabase
        .from('complaints')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      toast.success('Status updated');
      fetchComplaint();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Complaint not found</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-warning text-warning-foreground';
      case 'in_progress': return 'bg-primary text-primary-foreground';
      case 'resolved': return 'bg-success text-success-foreground';
      case 'closed': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent to-muted">
      <nav className="border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between p-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Brototype Complaints
          </h1>
        </div>
      </nav>

      <main className="container mx-auto max-w-4xl p-6 space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/complaints')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Complaints
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-2xl">{complaint.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Submitted by {complaint.profiles.name} on {format(new Date(complaint.created_at), 'PPP')}
                </p>
              </div>
              <div className="flex gap-2">
                <Badge className={getStatusColor(complaint.status)}>
                  {complaint.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{complaint.description}</p>
            </div>

            {attachments.length > 0 && (
              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-3">Attachments</h3>
                <div className="space-y-2">
                  {attachments.map((attachment) => (
                    <div 
                      key={attachment.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FileIcon className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium">{attachment.original_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(attachment.file_size / 1024 / 1024).toFixed(2)} MB • 
                            {' '}{format(new Date(attachment.uploaded_at), 'PPp')}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadAttachment(attachment)}
                        className="gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {profile?.role !== 'student' && (
              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-2">Update Status</h3>
                <Select value={complaint.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Messages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No messages yet. Start the conversation!
                </p>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-4 rounded-lg ${
                      message.sender_id === profile?.id
                        ? 'bg-primary/10 ml-8'
                        : 'bg-muted mr-8'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-semibold text-sm">{message.profiles.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(message.created_at), 'PPp')}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Textarea
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                rows={3}
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={sending || !newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}