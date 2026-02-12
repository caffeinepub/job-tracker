import { useState } from 'react';
import { useGetAllFirms, useAddOrUpdateFirm } from '../hooks/useFirms';
import AdminGuard from '../components/admin/AdminGuard';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Loader2, Plus, Pencil } from 'lucide-react';
import { Firm, Variant_big4_midSize_small } from '../backend';
import { toast } from 'sonner';

const sizeLabels: Record<Variant_big4_midSize_small, string> = {
  [Variant_big4_midSize_small.big4]: 'Big 4',
  [Variant_big4_midSize_small.midSize]: 'Mid-Size',
  [Variant_big4_midSize_small.small]: 'Small',
};

export default function AdminFirmsPage() {
  const { data: firms = [], isLoading } = useGetAllFirms();
  const addOrUpdateFirm = useAddOrUpdateFirm();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFirm, setEditingFirm] = useState<Firm | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    size: Variant_big4_midSize_small.midSize as Variant_big4_midSize_small,
  });

  const handleOpenDialog = (firm?: Firm) => {
    if (firm) {
      setEditingFirm(firm);
      setFormData({
        name: firm.name,
        description: firm.description,
        website: firm.website,
        size: firm.size,
      });
    } else {
      setEditingFirm(null);
      setFormData({
        name: '',
        description: '',
        website: '',
        size: Variant_big4_midSize_small.midSize,
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Firm name is required');
      return;
    }

    try {
      await addOrUpdateFirm.mutateAsync({
        id: editingFirm?.id || BigInt(0),
        name: formData.name.trim(),
        description: formData.description.trim(),
        website: formData.website.trim(),
        size: formData.size,
      });
      toast.success(editingFirm ? 'Firm updated successfully' : 'Firm added successfully');
      setDialogOpen(false);
    } catch (error) {
      toast.error('Failed to save firm');
    }
  };

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Manage Firms</h1>
            <p className="text-muted-foreground">Add and manage accounting firms</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Firm
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingFirm ? 'Edit Firm' : 'Add New Firm'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Firm Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Grant Thornton"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="size">Size</Label>
                  <Select value={formData.size} onValueChange={(v) => setFormData({ ...formData, size: v as Variant_big4_midSize_small })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(sizeLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={addOrUpdateFirm.isPending}>
                  {addOrUpdateFirm.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : editingFirm ? (
                    'Update Firm'
                  ) : (
                    'Add Firm'
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Firms</CardTitle>
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
                    <TableHead>Name</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Website</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {firms.map((firm) => (
                    <TableRow key={Number(firm.id)}>
                      <TableCell className="font-medium">{firm.name}</TableCell>
                      <TableCell>{sizeLabels[firm.size]}</TableCell>
                      <TableCell>
                        {firm.website && (
                          <a href={firm.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
                            Link
                          </a>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{firm.description}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(firm)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
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
