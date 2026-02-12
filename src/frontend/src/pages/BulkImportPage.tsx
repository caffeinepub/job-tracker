import { useState } from 'react';
import { useBulkImportJobs } from '../hooks/useQueries';
import AdminGuard from '../components/admin/AdminGuard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import { parseCSV, validateCSVRow, CSVValidationError } from '../utils/csvImport';
import { toast } from 'sonner';

export default function BulkImportPage() {
  const bulkImport = useBulkImportJobs();
  const [csvText, setCsvText] = useState('');
  const [errors, setErrors] = useState<CSVValidationError[]>([]);
  const [importSuccess, setImportSuccess] = useState(false);

  const handleImport = async () => {
    setErrors([]);
    setImportSuccess(false);

    if (!csvText.trim()) {
      toast.error('Please paste CSV data');
      return;
    }

    try {
      const rows = parseCSV(csvText);
      const validationErrors: CSVValidationError[] = [];
      const validRows: any[] = [];

      rows.forEach((row, index) => {
        const rowErrors = validateCSVRow(row, index + 2);
        if (rowErrors.length > 0) {
          validationErrors.push(...rowErrors);
        } else {
          validRows.push({
            title: row.title,
            firmName: row.firmName,
            category: row.category,
            location: row.location,
            postingUrl: row.postingUrl,
            isOpen: row.isOpen || 'true',
          });
        }
      });

      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        toast.error(`Found ${validationErrors.length} validation error(s)`);
        return;
      }

      if (validRows.length === 0) {
        toast.error('No valid rows to import');
        return;
      }

      const count = await bulkImport.mutateAsync(validRows);
      setImportSuccess(true);
      toast.success(`Successfully imported ${Number(count)} job posting(s)`);
      setCsvText('');
    } catch (error) {
      toast.error('Failed to import jobs');
      console.error(error);
    }
  };

  return (
    <AdminGuard>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Bulk Import Jobs</h1>
          <p className="text-muted-foreground">Import multiple job postings from CSV data</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>CSV Format</CardTitle>
            <CardDescription>
              Paste CSV data with the following columns: title, firmName, category, location, postingUrl, isOpen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-md font-mono text-xs overflow-x-auto">
              <div>title,firmName,category,location,postingUrl,isOpen</div>
              <div>Senior Auditor,Deloitte,Audit,"New York, NY",https://example.com/job1,true</div>
              <div>Tax Analyst,PwC,Tax,"Chicago, IL",https://example.com/job2,true</div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Valid categories:</p>
              <div className="flex flex-wrap gap-2">
                <code className="px-2 py-1 bg-muted rounded text-xs">Accounting</code>
                <code className="px-2 py-1 bg-muted rounded text-xs">Analytics</code>
                <code className="px-2 py-1 bg-muted rounded text-xs">Audit</code>
                <code className="px-2 py-1 bg-muted rounded text-xs">Tax</code>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Import Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="Paste CSV data here..."
              rows={12}
              className="font-mono text-sm"
            />
            <Button onClick={handleImport} disabled={bulkImport.isPending || !csvText.trim()}>
              {bulkImport.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Import Jobs
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-semibold mb-2">Validation Errors:</div>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {errors.map((error, index) => (
                  <li key={index}>
                    Row {error.row}: {error.message}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {importSuccess && (
          <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              Jobs imported successfully! They are now visible on the Job Board.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </AdminGuard>
  );
}
