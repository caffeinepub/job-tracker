import { useState, useMemo } from 'react';
import { useGetUserJobTracking } from '../hooks/useJobTracking';
import { useGetAllJobs } from '../hooks/useQueries';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { MapPin, Building2, Briefcase, Loader2 } from 'lucide-react';
import RequireAuth from '../components/auth/RequireAuth';
import EmptyState from '../components/common/EmptyState';
import JobDetailsDialog from '../components/jobs/JobDetailsDialog';
import { JobPosting, ApplicationStatus } from '../backend';
import { Button } from '../components/ui/button';
import { useNavigate } from '@tanstack/react-router';

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

const statusColors: Record<ApplicationStatus, string> = {
  [ApplicationStatus.notApplied]: 'bg-muted text-muted-foreground',
  [ApplicationStatus.applied]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  [ApplicationStatus.interviewing]: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  [ApplicationStatus.offer]: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  [ApplicationStatus.rejected]: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  [ApplicationStatus.withdrawn]: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
};

export default function MyTrackerPage() {
  const navigate = useNavigate();
  const { data: trackingData = [], isLoading: trackingLoading } = useGetUserJobTracking();
  const { data: allJobs = [] } = useGetAllJobs();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const savedTracking = useMemo(() => {
    return trackingData.filter((t) => t.saved);
  }, [trackingData]);

  const trackedJobs = useMemo(() => {
    return savedTracking
      .map((tracking) => {
        const job = allJobs.find((j) => Number(j.id) === Number(tracking.jobPostingId));
        return job ? { job, tracking } : null;
      })
      .filter((item): item is { job: JobPosting; tracking: typeof savedTracking[0] } => item !== null);
  }, [savedTracking, allJobs]);

  const filteredJobs = useMemo(() => {
    if (statusFilter === 'all') return trackedJobs;
    return trackedJobs.filter((item) => item.tracking.applicationStatus === statusFilter);
  }, [trackedJobs, statusFilter]);

  const handleJobClick = (job: JobPosting) => {
    setSelectedJob(job);
    setDialogOpen(true);
  };

  return (
    <RequireAuth>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">My Tracker</h1>
            <p className="text-muted-foreground">Track and manage your job applications</p>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.entries(statusLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {trackingLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredJobs.length === 0 ? (
          <EmptyState
            title={statusFilter === 'all' ? 'No saved jobs yet' : 'No jobs with this status'}
            description={
              statusFilter === 'all'
                ? 'Start tracking jobs by browsing the job board and saving positions that interest you.'
                : 'Try selecting a different status filter to see your tracked jobs.'
            }
            illustration={statusFilter === 'all'}
            action={
              statusFilter === 'all' ? (
                <Button onClick={() => navigate({ to: '/jobs' })}>Browse Job Board</Button>
              ) : undefined
            }
          />
        ) : (
          <div className="grid gap-4">
            {filteredJobs.map(({ job, tracking }) => (
              <Card
                key={Number(job.id)}
                className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
                onClick={() => handleJobClick(job)}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <h3 className="text-lg font-semibold">{job.title}</h3>
                        <div className="flex flex-wrap gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{job.firmName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{job.location}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">
                          <Briefcase className="h-3 w-3 mr-1" />
                          {categoryLabels[job.category]}
                        </Badge>
                        <Badge className={statusColors[tracking.applicationStatus]}>
                          {statusLabels[tracking.applicationStatus]}
                        </Badge>
                      </div>
                    </div>
                    {tracking.notes && (
                      <div className="pt-2 border-t">
                        <p className="text-sm text-muted-foreground line-clamp-2">{tracking.notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <JobDetailsDialog job={selectedJob} open={dialogOpen} onOpenChange={setDialogOpen} />
      </div>
    </RequireAuth>
  );
}
