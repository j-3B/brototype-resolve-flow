import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { ArrowLeft, Upload, X, FileIcon } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function ComplaintForm() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('medium');
  const [anonymous, setAnonymous] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
    } else {
      setCategories(data || []);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only images (JPG, PNG, GIF, WEBP) and PDF files are allowed');
      return;
    }

    setAttachedFile(file);
  };

  const removeFile = () => {
    setAttachedFile(null);
  };

  const uploadFile = async (complaintId: string): Promise<string | null> => {
    if (!attachedFile || !profile) return null;

    try {
      const fileExt = attachedFile.name.split('.').pop();
      const fileName = `${profile.id}/${complaintId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('complaint-attachments')
        .upload(fileName, attachedFile);

      if (uploadError) throw uploadError;

      return fileName;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile) {
      toast.error('You must be logged in to submit a complaint');
      return;
    }

    setLoading(true);

    try {
      // Create complaint
      const { data: complaint, error: complaintError } = await supabase
        .from('complaints')
        .insert({
          student_id: profile.id,
          title,
          description,
          category,
          priority,
          anonymous,
          status: 'open'
        })
        .select()
        .single();

      if (complaintError) throw complaintError;

      // Upload file if attached
      if (attachedFile) {
        try {
          const filePath = await uploadFile(complaint.id);
          
          if (filePath) {
            const { error: attachmentError } = await supabase
              .from('complaint_attachments')
              .insert({
                complaint_id: complaint.id,
                file_path: filePath,
                original_name: attachedFile.name,
                file_size: attachedFile.size
              });

            if (attachmentError) throw attachmentError;
          }
        } catch (fileError) {
          console.error('Error with file attachment:', fileError);
          toast.error('Complaint submitted, but file upload failed');
        }
      }

      toast.success('Complaint submitted successfully!');
      navigate(`/complaints/${complaint.id}`);
    } catch (error: any) {
      console.error('Error submitting complaint:', error);
      toast.error(error.message || 'Failed to submit complaint');
    } finally {
      setLoading(false);
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

      <main className="container mx-auto max-w-2xl p-6">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Submit a Complaint</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Brief description of your complaint"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength={200}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Provide detailed information about your complaint"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={6}
                  maxLength={2000}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority *</Label>
                  <Select value={priority} onValueChange={setPriority} required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="attachment">Attach File (Optional)</Label>
                <div className="space-y-3">
                  {!attachedFile ? (
                    <div className="relative">
                      <Input
                        id="attachment"
                        type="file"
                        onChange={handleFileChange}
                        accept="image/*,.pdf"
                        className="cursor-pointer"
                      />
                      <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <Upload className="h-4 w-4" />
                        <span>Images or PDF (Max 10MB)</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-3">
                      <div className="flex items-center gap-3">
                        <FileIcon className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium">{attachedFile.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(attachedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeFile}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="anonymous"
                  checked={anonymous}
                  onCheckedChange={setAnonymous}
                />
                <Label htmlFor="anonymous" className="cursor-pointer">
                  Submit anonymously
                </Label>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Complaint'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}