import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { ExternalLink, Bookmark, BookmarkCheck, MapPin, Building2, Briefcase, Loader2 } from 'lucide-react';
import { JobPosting, ApplicationStatus } from '../../backend';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetUserJobTracking, useSaveJobTracking } from '../../hooks/useJobTracking';
import RequireAuth from '../auth/RequireAuth';

interface JobDetailsDialogProps {
  job: JobPosting | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusLabels: Record<ApplicationStatus, string> = {
  [ApplicationStatus.notApplied]: 'Not Applied',
  [ApplicationStatus.applied]: 'Applied',
  [ApplicationStatus.interviewing]: 'Interviewing',
  [ApplicationStatus.offer]: 'Offer',
  [ApplicationStatus.rejected]: 'Rejected',
  [ApplicationStatus.withdrawn]: 'Withdrawn',
};

const categoryLabels = {
  accounting: 'Accounting',
  analytics: 'Analytics',
  audit: 'Audit',
  tax: 'Tax',
};

export default function JobDetailsDialog({ job, open, onOpenChange }: JobDetailsDialogProps) {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: trackingData } = useGetUserJobTracking();
  const saveTracking = useSaveJobTracking();

  const tracking = job ? trackingData?.find((t) => Number(t.jobPostingId) === Number(job.id)) : null;
  const [notes, setNotes] = useState(tracking?.notes || '');
  const [status, setStatus] = useState<ApplicationStatus>(tracking?.applicationStatus || ApplicationStatus.notApplied);

  if (!job) return null;

  const handleSaveToggle = async () => {
    if (!isAuthenticated) return;
    await saveTracking.mutateAsync({
      jobPostingId: job.id,
      saved: !tracking?.saved,
      applicationStatus: tracking?.applicationStatus || ApplicationStatus.notApplied,
      notes: tracking?.notes || '',
    });
  };

  const handleStatusChange = async (newStatus: ApplicationStatus) => {
    if (!isAuthenticated) return;
    setStatus(newStatus);
    await saveTracking.mutateAsync({
      jobPostingId: job.id,
      saved: tracking?.saved || true,
      applicationStatus: newStatus,
      notes: notes,
    });
  };

  const handleNotesUpdate = async () => {
    if (!isAuthenticated) return;
    await saveTracking.mutateAsync({
      jobPostingId: job.id,
      saved: tracking?.saved || true,
      applicationStatus: status,
      notes: notes,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl pr-8">{job.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{job.firmName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{job.location}</span>
            </div>
            <Badge variant="secondary">
              <Briefcase className="h-3 w-3 mr-1" />
              {categoryLabels[job.category]}
            </Badge>
          </div>

          <a
            href={job.postingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            View Job Posting
            <ExternalLink className="h-4 w-4" />
          </a>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Track This Job</h3>
            {isAuthenticated ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant={tracking?.saved ? 'default' : 'outline'}
                    size="sm"
                    onClick={handleSaveToggle}
                    disabled={saveTracking.isPending}
                  >
                    {saveTracking.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : tracking?.saved ? (
                      <BookmarkCheck className="h-4 w-4 mr-2" />
                    ) : (
                      <Bookmark className="h-4 w-4 mr-2" />
                    )}
                    {tracking?.saved ? 'Saved' : 'Save Job'}
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Application Status</Label>
                  <Select value={status} onValueChange={(v) => handleStatusChange(v as ApplicationStatus)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this job..."
                    rows={4}
                  />
                  <Button
                    size="sm"
                    onClick={handleNotesUpdate}
                    disabled={saveTracking.isPending || notes === (tracking?.notes || '')}
                  >
                    {saveTracking.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Update Notes'
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <RequireAuth>
                <div />
              </RequireAuth>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
