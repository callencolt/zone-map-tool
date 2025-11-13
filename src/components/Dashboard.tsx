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
  Download,
  ChevronDown,
  Settings,
} from "lucide-react";
import {
  getControllers,
  deleteController,
  deleteControllersByCampus,
  deleteControllersByBuilding,
  deleteControllersByFloor,
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { exportBatchToPDF, exportAllToExcel, exportBatchToExcel } from "@/lib/exportUtils";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardProps {
  onCreateNew: () => void;
  onEditController: (controller: ControllerData) => void;
  onOpenFixtures: () => void;
}

const Dashboard = ({ onCreateNew, onEditController, onOpenFixtures }: DashboardProps) => {
  const [controllers, setControllers] = useState<ControllerData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteCampus, setDeleteCampus] = useState<string | null>(null);
  const [deleteBuilding, setDeleteBuilding] = useState<{ campus: string; building: string } | null>(null);
  const [deleteFloor, setDeleteFloor] = useState<{ campus: string; building: string; floor: string } | null>(null);

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

  const handleDeleteCampus = (campus: string) => {
    deleteControllersByCampus(campus);
    loadControllers();
    setDeleteCampus(null);
    toast.success(`Deleted all controllers in campus: ${campus}`);
  };

  const handleDeleteBuilding = (campus: string, building: string) => {
    deleteControllersByBuilding(campus, building);
    loadControllers();
    setDeleteBuilding(null);
    toast.success(`Deleted all controllers in building: ${building}`);
  };

  const handleDeleteFloor = (campus: string, building: string, floor: string) => {
    deleteControllersByFloor(campus, building, floor);
    loadControllers();
    setDeleteFloor(null);
    toast.success(`Deleted all controllers on floor: ${floor}`);
  };

  const calculateTotalPower = (channels: ControllerData["channels"]) => {
    return channels.reduce((total, channel) => {
      const power =
        (parseFloat(channel.voltage) || 0) * (parseFloat(channel.current) || 0) * (channel.parallelCount || 1);
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

  // Group controllers hierarchically
  const groupedControllers = filteredControllers.reduce((acc, controller) => {
    const campus = controller.campus || 'Unknown Campus';
    const building = controller.building || 'Unknown Building';
    const floor = controller.floor || 'Unknown Floor';

    if (!acc[campus]) acc[campus] = {};
    if (!acc[campus][building]) acc[campus][building] = {};
    if (!acc[campus][building][floor]) acc[campus][building][floor] = [];
    
    acc[campus][building][floor].push(controller);
    return acc;
  }, {} as Record<string, Record<string, Record<string, ControllerData[]>>>);

  const handleExportSectionPDF = async (
    controllers: ControllerData[],
    sectionName: string
  ) => {
    try {
      await exportBatchToPDF(controllers, sectionName);
      toast.success(`Exported ${controllers.length} controller(s) to PDF`);
    } catch (error) {
      toast.error("Failed to export PDF");
      console.error(error);
    }
  };

  const handleExportSectionExcel = (
    controllers: ControllerData[],
    sectionName: string
  ) => {
    try {
      exportBatchToExcel(controllers, sectionName);
      toast.success(`Exported ${controllers.length} controller(s) to Excel`);
    } catch (error) {
      toast.error("Failed to export Excel");
      console.error(error);
    }
  };

  const handleExportAllPDF = async () => {
    try {
      await exportBatchToPDF(controllers, "All_Controllers");
      toast.success(`Exported ${controllers.length} controller(s) to PDF`);
    } catch (error) {
      toast.error("Failed to export PDF");
      console.error(error);
    }
  };

  const handleExportAllExcel = () => {
    try {
      exportAllToExcel(controllers);
      toast.success(`Exported ${controllers.length} controller(s) to Excel`);
    } catch (error) {
      toast.error("Failed to export Excel");
      console.error(error);
    }
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
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Export All
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleExportAllPDF}>
                    Export to PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportAllExcel}>
                    Export to Excel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                onClick={onOpenFixtures}
                variant="outline"
                className="gap-2"
              >
                <Settings className="h-4 w-4" />
                Fixture Config
              </Button>
              <Button onClick={onCreateNew} className="gap-2">
                <Plus className="h-4 w-4" />
                New Controller
              </Button>
            </div>
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

        {/* Controllers Hierarchy */}
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
          <div className="space-y-4">
            {Object.entries(groupedControllers).map(([campus, buildings]) => (
              <Card key={campus} className="overflow-hidden">
                <Accordion type="multiple" className="w-full">
                  <AccordionItem value={campus} className="border-none">
                    <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div className="text-left">
                            <h3 className="font-semibold text-foreground">Campus: {campus}</h3>
                            <p className="text-sm text-muted-foreground">
                              {Object.values(buildings).reduce((sum, floors) => 
                                sum + Object.values(floors).reduce((s, ctrls) => s + ctrls.length, 0), 0
                              )} controller(s)
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Download className="h-4 w-4" />
                                Export
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const allControllers = Object.values(buildings).flatMap(floors =>
                                    Object.values(floors).flat()
                                  );
                                  handleExportSectionPDF(allControllers, campus);
                                }}
                              >
                                Export to PDF
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const allControllers = Object.values(buildings).flatMap(floors =>
                                    Object.values(floors).flat()
                                  );
                                  handleExportSectionExcel(allControllers, campus);
                                }}
                              >
                                Export to Excel
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteCampus(campus);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4">
                      <Accordion type="multiple" className="w-full space-y-2">
                        {Object.entries(buildings).map(([building, floors]) => (
                          <AccordionItem key={building} value={building} className="border rounded-lg">
                            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/30">
                              <div className="flex items-center justify-between w-full pr-4">
                                <div className="text-left">
                                  <h4 className="font-medium text-foreground">Building: {building}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {Object.values(floors).reduce((sum, ctrls) => sum + ctrls.length, 0)} controller(s)
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="gap-2"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <Download className="h-4 w-4" />
                                        Export
                                        <ChevronDown className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
                                      <DropdownMenuItem
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const allControllers = Object.values(floors).flat();
                                          handleExportSectionPDF(allControllers, `${campus}_${building}`);
                                        }}
                                      >
                                        Export to PDF
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const allControllers = Object.values(floors).flat();
                                          handleExportSectionExcel(allControllers, `${campus}_${building}`);
                                        }}
                                      >
                                        Export to Excel
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDeleteBuilding({ campus, building });
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pb-3">
                              <Accordion type="multiple" className="w-full space-y-2">
                                {Object.entries(floors).map(([floor, controllers]) => (
                                  <AccordionItem key={floor} value={floor} className="border rounded-lg bg-card">
                                    <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/20">
                                      <div className="flex items-center justify-between w-full pr-4">
                                        <div className="text-left">
                                          <h5 className="font-medium text-foreground">Floor: {floor}</h5>
                                          <p className="text-sm text-muted-foreground">
                                            {controllers.length} controller(s)
                                          </p>
                                        </div>
                                        <div className="flex gap-2">
                                          <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                className="gap-2"
                                                onClick={(e) => e.stopPropagation()}
                                              >
                                                <Download className="h-4 w-4" />
                                                Export
                                                <ChevronDown className="h-4 w-4" />
                                              </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
                                              <DropdownMenuItem
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleExportSectionPDF(controllers, `${campus}_${building}_${floor}`);
                                                }}
                                              >
                                                Export to PDF
                                              </DropdownMenuItem>
                                              <DropdownMenuItem
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleExportSectionExcel(controllers, `${campus}_${building}_${floor}`);
                                                }}
                                              >
                                                Export to Excel
                                              </DropdownMenuItem>
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setDeleteFloor({ campus, building, floor });
                                            }}
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 pb-3">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {controllers.map((controller) => {
                                          const totalPower = calculateTotalPower(controller.channels);
                                          const warning = hasWarning(controller);

                                          return (
                                            <Card
                                              key={controller.id}
                                              className={`p-4 ${warning ? "border-accent" : ""}`}
                                            >
                                              {warning && (
                                                <div className="flex items-center gap-2 mb-3 p-2 bg-accent/10 rounded text-accent text-sm">
                                                  <AlertTriangle className="h-4 w-4" />
                                                  <span className="font-medium">Near power limit</span>
                                                </div>
                                              )}

                                              <div className="mb-4">
                                                <div className="flex items-start justify-between mb-2">
                                                  <div>
                                                    <h3 className="font-semibold text-foreground">
                                                      Controller {controller.controllerNumber}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                      Zone: {controller.zone}
                                                    </p>
                                                  </div>
                                                </div>

                                                <div className="space-y-1 text-sm">
                                                  <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Channels:</span>
                                                    <span className="font-medium text-foreground">
                                                      {controller.channels.length}
                                                    </span>
                                                  </div>
                                                  <div className="flex justify-between pt-2 border-t border-border">
                                                    <span className="text-muted-foreground">Total Power:</span>
                                                    <span className="font-bold text-primary">
                                                      {totalPower.toFixed(2)} W
                                                    </span>
                                                  </div>
                                                  {controller.powerLimit && (
                                                    <div className="flex justify-between">
                                                      <span className="text-muted-foreground">Limit:</span>
                                                      <span className="text-sm text-muted-foreground">
                                                        {controller.powerLimit} W (
                                                        {((totalPower / controller.powerLimit) * 100).toFixed(0)}%)
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
                                    </AccordionContent>
                                  </AccordionItem>
                                ))}
                              </Accordion>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Controller Confirmation Dialog */}
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

      {/* Delete Campus Confirmation Dialog */}
      <AlertDialog open={!!deleteCampus} onOpenChange={() => setDeleteCampus(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Entire Campus?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete ALL controllers
              in campus "{deleteCampus}" including all buildings, floors, and zones.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteCampus && handleDeleteCampus(deleteCampus)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Building Confirmation Dialog */}
      <AlertDialog open={!!deleteBuilding} onOpenChange={() => setDeleteBuilding(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Entire Building?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete ALL controllers
              in building "{deleteBuilding?.building}" including all floors and zones.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteBuilding && handleDeleteBuilding(deleteBuilding.campus, deleteBuilding.building)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Floor Confirmation Dialog */}
      <AlertDialog open={!!deleteFloor} onOpenChange={() => setDeleteFloor(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Entire Floor?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete ALL controllers
              on floor "{deleteFloor?.floor}" including all zones.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteFloor && handleDeleteFloor(deleteFloor.campus, deleteFloor.building, deleteFloor.floor)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
