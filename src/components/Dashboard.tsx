import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Plus,
  FileText,
  Trash2,
  Search,
  Edit,
  AlertTriangle,
} from "lucide-react";
import {
  getControllers,
  deleteController,
  ControllerData,
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

interface DashboardProps {
  onCreateNew: () => void;
  onEditController: (controller: ControllerData) => void;
}

const Dashboard = ({ onCreateNew, onEditController }: DashboardProps) => {
  const [controllers, setControllers] = useState<ControllerData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadControllers();
  }, []);

  const loadControllers = () => {
    setControllers(getControllers());
  };

  const handleDelete = (id: string) => {
    deleteController(id);
    loadControllers();
    setDeleteId(null);
  };

  const calculateTotalPower = (channels: ControllerData["channels"]) => {
    return channels.reduce((total, channel) => {
      const power =
        (parseFloat(channel.voltage) || 0) * (parseFloat(channel.current) || 0);
      return total + power;
    }, 0);
  };

  const filteredControllers = controllers.filter((controller) => {
    const search = searchTerm.toLowerCase();
    return (
      controller.campus.toLowerCase().includes(search) ||
      controller.building.toLowerCase().includes(search) ||
      controller.floor.toLowerCase().includes(search) ||
      controller.zone.toLowerCase().includes(search) ||
      controller.controllerNumber.toLowerCase().includes(search)
    );
  });

  const hasWarning = (controller: ControllerData) => {
    if (!controller.powerLimit) return false;
    const totalPower = calculateTotalPower(controller.channels);
    return totalPower >= controller.powerLimit * 0.8;
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Controller Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage and monitor all controller documentation
              </p>
            </div>
            <Button onClick={onCreateNew} className="gap-2">
              <Plus className="h-4 w-4" />
              New Controller
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by campus, building, floor, zone, or controller number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Controllers
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {controllers.length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">With Warnings</p>
                <p className="text-2xl font-bold text-foreground">
                  {controllers.filter(hasWarning).length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary rounded-lg">
                <FileText className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Channels
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {controllers.reduce(
                    (sum, c) => sum + c.channels.length,
                    0
                  )}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Controllers Grid */}
        {filteredControllers.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchTerm ? "No controllers found" : "No controllers yet"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Create your first controller documentation sheet"}
            </p>
            {!searchTerm && (
              <Button onClick={onCreateNew} className="gap-2">
                <Plus className="h-4 w-4" />
                Create First Controller
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredControllers.map((controller) => {
              const totalPower = calculateTotalPower(controller.channels);
              const warning = hasWarning(controller);

              return (
                <Card
                  key={controller.id}
                  className={`p-4 hover:shadow-lg transition-shadow ${
                    warning ? "border-accent" : ""
                  }`}
                >
                  {warning && (
                    <div className="flex items-center gap-2 mb-3 p-2 bg-accent/10 rounded text-accent text-sm">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-medium">
                        Near power limit
                      </span>
                    </div>
                  )}

                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-foreground">
                          Controller {controller.controllerNumber}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {controller.building} - {controller.zone}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Campus:</span>
                        <span className="font-medium text-foreground">
                          {controller.campus}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Floor:</span>
                        <span className="font-medium text-foreground">
                          {controller.floor}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Channels:
                        </span>
                        <span className="font-medium text-foreground">
                          {controller.channels.length}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-border">
                        <span className="text-muted-foreground">
                          Total Power:
                        </span>
                        <span className="font-bold text-primary">
                          {totalPower.toFixed(2)} W
                        </span>
                      </div>
                      {controller.powerLimit && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Limit:</span>
                          <span className="text-sm text-muted-foreground">
                            {controller.powerLimit} W (
                            {((totalPower / controller.powerLimit) * 100).toFixed(
                              0
                            )}
                            %)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => onEditController(controller)}
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => setDeleteId(controller.id)}
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Controller?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              controller documentation.
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

export default Dashboard;
