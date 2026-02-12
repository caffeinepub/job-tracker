import { useState, useMemo } from 'react';
import { useGetAllOpenJobs, useGetAllFirms } from '../hooks/useQueries';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Search, MapPin, Building2, Briefcase, Loader2 } from 'lucide-react';
import JobDetailsDialog from '../components/jobs/JobDetailsDialog';
import { JobPosting } from '../backend';

const categoryLabels = {
  accounting: 'Accounting',
  analytics: 'Analytics',
  audit: 'Audit',
  tax: 'Tax',
};

export default function JobBoardPage() {
  const { data: jobs = [], isLoading: jobsLoading } = useGetAllOpenJobs();
  const { data: firms = [] } = useGetAllFirms();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFirm, setSelectedFirm] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        searchTerm === '' ||
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFirm = selectedFirm === 'all' || job.firmName === selectedFirm;
      const matchesCategory = selectedCategory === 'all' || job.category === selectedCategory;
      return matchesSearch && matchesFirm && matchesCategory;
    });
  }, [jobs, searchTerm, selectedFirm, selectedCategory]);

  const handleJobClick = (job: JobPosting) => {
    setSelectedJob(job);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Job Board</h1>
        <p className="text-muted-foreground">
          Browse open accounting and analytics positions at Big 4 and mid-size firms
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedFirm} onValueChange={setSelectedFirm}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="All Firms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Firms</SelectItem>
            {firms.map((firm) => (
              <SelectItem key={Number(firm.id)} value={firm.name}>
                {firm.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {jobsLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredJobs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No jobs found matching your criteria.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredJobs.map((job) => (
            <Card
              key={Number(job.id)}
              className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
              onClick={() => handleJobClick(job)}
            >
              <CardContent className="p-6">
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
                  <Badge variant="secondary" className="self-start">
                    <Briefcase className="h-3 w-3 mr-1" />
                    {categoryLabels[job.category]}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <JobDetailsDialog job={selectedJob} open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
