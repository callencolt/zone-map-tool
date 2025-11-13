import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Plus,
  Trash2,
  Settings,
  ArrowLeft,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import {
  FixtureConfig,
  saveFixtureConfig,
  getFixtureConfigs,
  deleteFixtureConfig,
} from "@/lib/controllerStorage";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface FixtureConfigManagerProps {
  onBack: () => void;
}

const FixtureConfigManager = ({ onBack }: FixtureConfigManagerProps) => {
  const [fixtures, setFixtures] = useState<FixtureConfig[]>([]);
  const [newFixture, setNewFixture] = useState({
    name: "",
    voltage: "",
    current: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadFixtures();
  }, []);

  const loadFixtures = () => {
    setFixtures(getFixtureConfigs());
  };

  const handleAddFixture = () => {
    if (!newFixture.name || !newFixture.voltage || !newFixture.current) {
      toast.error("Please fill in all fields");
      return;
    }

    const fixture: FixtureConfig = {
      id: editingId || Date.now().toString(),
      name: newFixture.name,
      voltage: newFixture.voltage,
      current: newFixture.current,
      createdAt: new Date().toISOString(),
    };

    saveFixtureConfig(fixture);
    loadFixtures();
    setNewFixture({ name: "", voltage: "", current: "" });
    setEditingId(null);
    toast.success(editingId ? "Fixture updated" : "Fixture added");
  };

  const handleEdit = (fixture: FixtureConfig) => {
    setNewFixture({
      name: fixture.name,
      voltage: fixture.voltage,
      current: fixture.current,
    });
    setEditingId(fixture.id);
    
    // Scroll to the form
    setTimeout(() => {
      document.getElementById('fixture-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleDelete = (id: string) => {
    deleteFixtureConfig(id);
    loadFixtures();
    setDeleteId(null);
    toast.success("Fixture deleted");
  };

  const handleCancel = () => {
    setNewFixture({ name: "", voltage: "", current: "" });
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <Card className="p-6 md:p-8 shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-border">
            <div className="flex items-center gap-3">
              <Button onClick={onBack} variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Settings className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                    Fixture Configuration
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage pre-configured fixture types
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Add/Edit Form */}
          <div id="fixture-form" className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="h-1 w-8 bg-primary rounded"></span>
              {editingId ? "Edit Fixture" : "Add New Fixture"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium">
                  Fixture Name *
                </Label>
                <Input
                  id="name"
                  value={newFixture.name}
                  onChange={(e) =>
                    setNewFixture({ ...newFixture, name: e.target.value })
                  }
                  placeholder="e.g. L01"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="voltage" className="text-sm font-medium">
                  Voltage (V) *
                </Label>
                <Input
                  id="voltage"
                  type="number"
                  value={newFixture.voltage}
                  onChange={(e) =>
                    setNewFixture({ ...newFixture, voltage: e.target.value })
                  }
                  placeholder="e.g. 24"
                  className="mt-1.5"
                  step="0.1"
                />
              </div>
              <div>
                <Label htmlFor="current" className="text-sm font-medium">
                  Current (A) *
                </Label>
                <Input
                  id="current"
                  type="number"
                  value={newFixture.current}
                  onChange={(e) =>
                    setNewFixture({ ...newFixture, current: e.target.value })
                  }
                  placeholder="e.g. 0.625"
                  className="mt-1.5"
                  step="0.001"
                />
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={handleAddFixture} className="gap-2 flex-1">
                  {editingId ? (
                    <>
                      <Save className="h-4 w-4" />
                      Update
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Add
                    </>
                  )}
                </Button>
                {editingId && (
                  <Button onClick={handleCancel} variant="outline">
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Fixtures List */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="h-1 w-8 bg-primary rounded"></span>
              Saved Fixtures ({fixtures.length})
            </h2>

            {fixtures.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No fixtures configured yet</p>
                <p className="text-sm mt-2">Add your first fixture above to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-full inline-block align-middle">
                  <div className="overflow-hidden border border-border rounded-lg">
                    <table className="min-w-full divide-y divide-border">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                            Fixture Name
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                            Voltage (V)
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                            Current (A)
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                            Power (W)
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-foreground uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-card divide-y divide-border">
                        {fixtures.map((fixture) => {
                          const power = parseFloat(fixture.voltage) * parseFloat(fixture.current);
                          return (
                            <tr
                              key={fixture.id}
                              className="hover:bg-muted/50 transition-colors"
                            >
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-foreground">
                                {fixture.name}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">
                                {fixture.voltage}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">
                                {fixture.current}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">
                                {power.toFixed(3)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                                <div className="flex gap-2 justify-end">
                                  <Button
                                    onClick={() => handleEdit(fixture)}
                                    variant="ghost"
                                    size="sm"
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    onClick={() => setDeleteId(fixture.id)}
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Fixture Configuration</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this fixture configuration? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FixtureConfigManager;
