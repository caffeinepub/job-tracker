import { useState } from 'react';
import { useGetAllJobs, useGetAllFirms, useCreateOrUpdateJobPosting, useCloseJobPosting } from '../hooks/useQueries';
import AdminGuard from '../components/admin/AdminGuard';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { Loader2, Plus, XCircle } from 'lucide-react';
import { JobPosting, JobCategory, EmploymentType } from '../backend';
import { toast } from 'sonner';

const categoryLabels: Record<JobCategory, string> = {
  [JobCategory.accounting]: 'Accounting',
  [JobCategory.analytics]: 'Analytics',
  [JobCategory.audit]: 'Audit',
  [JobCategory.tax]: 'Tax',
};

const employmentTypeLabels: Record<EmploymentType, string> = {
  [EmploymentType.fullTime]: 'Full-Time',
  [EmploymentType.partTime]: 'Part-Time',
  [EmploymentType.internship]: 'Internship',
  [EmploymentType.contract]: 'Contract',
};

export default function AdminJobsPage() {
  const { data: jobs = [], isLoading } = useGetAllJobs();
  const { data: firms = [] } = useGetAllFirms();
  const createOrUpdateJob = useCreateOrUpdateJobPosting();
  const closeJob = useCloseJobPosting();
  const [dialogOpen, setDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    firmId: '',
    category: JobCategory.accounting as JobCategory,
    location: '',
    postingUrl: '',
    employmentType: EmploymentType.fullTime as EmploymentType,
  });

  const handleOpenDialog = () => {
    setFormData({
      title: '',
      firmId: '',
      category: JobCategory.accounting,
      location: '',
      postingUrl: '',
      employmentType: EmploymentType.fullTime,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.firmId || !formData.location.trim() || !formData.postingUrl.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const selectedFirm = firms.find((f) => Number(f.id) === Number(formData.firmId));
    if (!selectedFirm) {
      toast.error('Invalid firm selected');
      return;
    }

    try {
      await createOrUpdateJob.mutateAsync({
        title: formData.title.trim(),
        firmId: BigInt(formData.firmId),
        firmName: selectedFirm.name,
        category: formData.category,
        location: formData.location.trim(),
        postingUrl: formData.postingUrl.trim(),
        employmentType: formData.employmentType,
        datePosted: BigInt(Date.now() * 1_000_000),
        isOpen: true,
      });
      toast.success('Job posting created successfully');
      setDialogOpen(false);
    } catch (error) {
      toast.error('Failed to create job posting');
    }
  };

  const handleCloseJob = async (jobId: bigint) => {
    try {
      await closeJob.mutateAsync(jobId);
      toast.success('Job posting closed');
    } catch (error) {
      toast.error('Failed to close job posting');
    }
  };

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Manage Jobs</h1>
            <p className="text-muted-foreground">Create and manage job postings</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Job
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Job Posting</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Senior Auditor"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="firm">Firm *</Label>
                  <Select value={formData.firmId} onValueChange={(v) => setFormData({ ...formData, firmId: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a firm" />
                    </SelectTrigger>
                    <SelectContent>
                      {firms.map((firm) => (
                        <SelectItem key={Number(firm.id)} value={String(firm.id)}>
                          {firm.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v as JobCategory })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(categoryLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., New York, NY"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employmentType">Employment Type</Label>
                  <Select value={formData.employmentType} onValueChange={(v) => setFormData({ ...formData, employmentType: v as EmploymentType })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(employmentTypeLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postingUrl">Posting URL *</Label>
                  <Input
                    id="postingUrl"
                    type="url"
                    value={formData.postingUrl}
                    onChange={(e) => setFormData({ ...formData, postingUrl: e.target.value })}
                    placeholder="https://..."
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={createOrUpdateJob.isPending}>
                  {createOrUpdateJob.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Job Posting'
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Job Postings</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Firm</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job) => (
                    <TableRow key={Number(job.id)}>
                      <TableCell className="font-medium">{job.title}</TableCell>
                      <TableCell>{job.firmName}</TableCell>
                      <TableCell>{categoryLabels[job.category]}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{job.location}</TableCell>
                      <TableCell>
                        <Badge variant={job.isOpen ? 'default' : 'secondary'}>{job.isOpen ? 'Open' : 'Closed'}</Badge>
                      </TableCell>
                      <TableCell>
                        {job.isOpen && (
                          <Button variant="ghost" size="sm" onClick={() => handleCloseJob(job.id)} disabled={closeJob.isPending}>
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminGuard>
  );
}
