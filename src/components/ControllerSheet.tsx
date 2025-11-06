import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Plus,
  Trash2,
  FileText,
  Download,
  Save,
  ArrowLeft,
  AlertTriangle,
  BookTemplate,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  Channel,
  ControllerData,
  saveController,
  saveTemplate,
  getTemplates,
  ControllerTemplate,
} from "@/lib/controllerStorage";
import { exportToExcel, exportToPDF } from "@/lib/exportUtils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface ControllerSheetProps {
  initialData?: ControllerData;
  onBack: () => void;
}

const ControllerSheet = ({ initialData, onBack }: ControllerSheetProps) => {
  const [controllerId] = useState(initialData?.id || Date.now().toString());
  const [campus, setCampus] = useState(initialData?.campus || "");
  const [building, setBuilding] = useState(initialData?.building || "");
  const [floor, setFloor] = useState(initialData?.floor || "");
  const [zone, setZone] = useState(initialData?.zone || "");
  const [controllerNumber, setControllerNumber] = useState(
    initialData?.controllerNumber || ""
  );
  const [powerLimit, setPowerLimit] = useState(
    initialData?.powerLimit?.toString() || ""
  );
  const [channels, setChannels] = useState<Channel[]>(
    initialData?.channels || [
      { id: "1", channelNumber: 1, fixtureType: "", voltage: "", current: "", parallelCount: 1 },
    ]
  );
  const [templates, setTemplates] = useState<ControllerTemplate[]>([]);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");

  useEffect(() => {
    setTemplates(getTemplates());
  }, []);

  const addChannel = () => {
    const newChannelNumber =
      channels.length > 0 ? Math.max(...channels.map((c) => c.channelNumber)) + 1 : 1;
    setChannels([
      ...channels,
      {
        id: Date.now().toString(),
        channelNumber: newChannelNumber,
        fixtureType: "",
        voltage: "",
        current: "",
        parallelCount: 1,
      },
    ]);
  };

  const removeChannel = (id: string) => {
    if (channels.length === 1) {
      toast.error("Cannot remove the last channel");
      return;
    }
    setChannels(channels.filter((channel) => channel.id !== id));
  };

  const updateChannel = (id: string, field: keyof Channel, value: string) => {
    setChannels(
      channels.map((channel) =>
        channel.id === id ? { ...channel, [field]: value } : channel
      )
    );
  };

  const calculatePower = (voltage: string, current: string, parallelCount: number): number => {
    const v = parseFloat(voltage) || 0;
    const a = parseFloat(current) || 0;
    const count = parallelCount || 1;
    return v * a * count;
  };

  const getTotalPower = (): number => {
    return channels.reduce((total, channel) => {
      return total + calculatePower(channel.voltage, channel.current, channel.parallelCount);
    }, 0);
  };

  const getPowerLimitWarning = (): string | null => {
    const limit = parseFloat(powerLimit);
    if (!limit) return null;

    const total = getTotalPower();
    const percentage = (total / limit) * 100;

    if (percentage >= 100) {
      return "CRITICAL: Power limit exceeded!";
    } else if (percentage >= 90) {
      return "WARNING: Power at 90% of limit";
    } else if (percentage >= 80) {
      return "CAUTION: Power approaching limit";
    }
    return null;
  };

  const handleSave = () => {
    if (!campus || !building || !controllerNumber) {
      toast.error("Please fill in campus, building, and controller number");
      return;
    }

    const controllerData: ControllerData = {
      id: controllerId,
      campus,
      building,
      floor,
      zone,
      controllerNumber,
      channels,
      powerLimit: powerLimit ? parseFloat(powerLimit) : undefined,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveController(controllerData);
    toast.success("Controller saved successfully");
  };

  const handleSaveAndReturn = () => {
    handleSave();
    setTimeout(onBack, 500);
  };

  const handleExportExcel = () => {
    const controllerData: ControllerData = {
      id: controllerId,
      campus,
      building,
      floor,
      zone,
      controllerNumber,
      channels,
      powerLimit: powerLimit ? parseFloat(powerLimit) : undefined,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    exportToExcel(controllerData);
    toast.success("Exported to Excel");
  };

  const handleExportPDF = async () => {
    const controllerData: ControllerData = {
      id: controllerId,
      campus,
      building,
      floor,
      zone,
      controllerNumber,
      channels,
      powerLimit: powerLimit ? parseFloat(powerLimit) : undefined,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await exportToPDF("controller-sheet-content", controllerData);
    toast.success("Exported to PDF");
  };

  const handleSaveAsTemplate = () => {
    if (!templateName.trim()) {
      toast.error("Please enter a template name");
      return;
    }

    const template: ControllerTemplate = {
      id: Date.now().toString(),
      name: templateName,
      description: templateDescription,
      campus,
      building,
      floor,
      zone,
      controllerNumber,
      powerLimit: powerLimit ? parseFloat(powerLimit) : undefined,
      channels: channels.map(({ id, ...channel }) => channel),
      createdAt: new Date().toISOString(),
    };

    saveTemplate(template);
    setTemplates(getTemplates());
    setShowTemplateDialog(false);
    setTemplateName("");
    setTemplateDescription("");
    toast.success("Template saved successfully");
  };

  const handleLoadTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;

    const newChannels: Channel[] = template.channels.map((channel, index) => ({
      ...channel,
      id: Date.now().toString() + index,
    }));

    setChannels(newChannels);
    
    // Load controller info if available
    if (template.campus) setCampus(template.campus);
    if (template.building) setBuilding(template.building);
    if (template.floor) setFloor(template.floor);
    if (template.zone) setZone(template.zone);
    if (template.controllerNumber) setControllerNumber(template.controllerNumber);
    if (template.powerLimit) setPowerLimit(template.powerLimit.toString());
    
    toast.success(`Loaded template: ${template.name}`);
  };

  const warning = getPowerLimitWarning();
  const totalPower = getTotalPower();
  const limit = parseFloat(powerLimit);
  const powerPercentage = limit ? (totalPower / limit) * 100 : 0;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <Card className="p-6 md:p-8 shadow-lg" id="controller-sheet-content">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-border">
            <div className="flex items-center gap-3">
              <Button
                onClick={onBack}
                variant="ghost"
                size="icon"
                className="print:hidden"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                    Controller Documentation
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    {initialData ? "Edit" : "Create"} controller specifications
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2 print:hidden">
              <Button
                onClick={handleExportExcel}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Excel
              </Button>
              <Button
                onClick={handleExportPDF}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                PDF
              </Button>
              <Button onClick={handleSave} variant="outline" size="sm" className="gap-2">
                <Save className="h-4 w-4" />
                Save
              </Button>
              <Button onClick={handleSaveAndReturn} size="sm" className="gap-2">
                <Save className="h-4 w-4" />
                Save & Exit
              </Button>
            </div>
          </div>

          {/* Power Warning */}
          {warning && (
            <div
              className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                powerPercentage >= 100
                  ? "bg-destructive/10 border border-destructive text-destructive"
                  : powerPercentage >= 90
                  ? "bg-destructive/10 border border-destructive/50 text-destructive"
                  : "bg-accent/10 border border-accent text-accent"
              }`}
            >
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold">{warning}</p>
                <p className="text-sm opacity-90">
                  {totalPower.toFixed(2)} W / {limit} W ({powerPercentage.toFixed(1)}%)
                </p>
              </div>
            </div>
          )}

          {/* Controller Information */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="h-1 w-8 bg-primary rounded"></span>
              Controller Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <Label htmlFor="campus" className="text-sm font-medium">
                  Campus *
                </Label>
                <Input
                  id="campus"
                  value={campus}
                  onChange={(e) => setCampus(e.target.value)}
                  placeholder="Enter campus"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="building" className="text-sm font-medium">
                  Building *
                </Label>
                <Input
                  id="building"
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                  placeholder="Enter building"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="floor" className="text-sm font-medium">
                  Floor
                </Label>
                <Input
                  id="floor"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  placeholder="Enter floor"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="zone" className="text-sm font-medium">
                  Zone
                </Label>
                <Input
                  id="zone"
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  placeholder="Enter zone"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="controllerNumber" className="text-sm font-medium">
                  Controller # *
                </Label>
                <Input
                  id="controllerNumber"
                  value={controllerNumber}
                  onChange={(e) => setControllerNumber(e.target.value)}
                  placeholder="Enter number"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="powerLimit" className="text-sm font-medium">
                  Power Limit (W)
                </Label>
                <Input
                  id="powerLimit"
                  type="number"
                  value={powerLimit}
                  onChange={(e) => setPowerLimit(e.target.value)}
                  placeholder="Optional"
                  className="mt-1.5"
                  step="0.1"
                />
              </div>
            </div>
          </div>

          {/* Channels Table */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <span className="h-1 w-8 bg-primary rounded"></span>
                Channel Configuration
              </h2>
              <div className="flex gap-2 print:hidden">
                {templates.length > 0 && (
                  <Select onValueChange={handleLoadTemplate}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Load template..." />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <Button
                  onClick={() => setShowTemplateDialog(true)}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <BookTemplate className="h-4 w-4" />
                  Save as Template
                </Button>
                <Button onClick={addChannel} size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Channel
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-full inline-block align-middle">
                <div className="overflow-hidden border border-border rounded-lg">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                          Channel
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                          Fixture Type
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                          Voltage (V)
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                          Current (A)
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                          Qty Parallel
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                          Power (W)
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-foreground uppercase tracking-wider print:hidden">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                      {channels.map((channel) => {
                        const power = calculatePower(channel.voltage, channel.current, channel.parallelCount);
                        return (
                          <tr key={channel.id} className="hover:bg-muted/50 transition-colors">
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-foreground">
                              {channel.channelNumber}
                            </td>
                            <td className="px-4 py-3">
                              <Input
                                value={channel.fixtureType}
                                onChange={(e) =>
                                  updateChannel(channel.id, "fixtureType", e.target.value)
                                }
                                placeholder="e.g., LED Panel"
                                className="h-9"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <Input
                                type="number"
                                value={channel.voltage}
                                onChange={(e) =>
                                  updateChannel(channel.id, "voltage", e.target.value)
                                }
                                placeholder="0"
                                className="h-9 w-24"
                                step="0.1"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <Input
                                type="number"
                                value={channel.current}
                                onChange={(e) =>
                                  updateChannel(channel.id, "current", e.target.value)
                                }
                                placeholder="0"
                                className="h-9 w-24"
                                step="0.1"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <Input
                                type="number"
                                value={channel.parallelCount}
                                onChange={(e) =>
                                  updateChannel(channel.id, "parallelCount", e.target.value)
                                }
                                placeholder="1"
                                className="h-9 w-20"
                                min="1"
                                step="1"
                              />
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-foreground">
                              {power > 0 ? power.toFixed(2) : "—"}
                            </td>
                            <td className="px-4 py-3 text-right print:hidden">
                              <Button
                                onClick={() => removeChannel(channel.id)}
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-muted">
                      <tr>
                        <td colSpan={5} className="px-4 py-3 text-right text-sm font-semibold text-foreground">
                          Total Power Output:
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-primary">
                          {getTotalPower().toFixed(2)} W
                        </td>
                        <td className="print:hidden"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="mt-8 p-4 bg-muted/50 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Note:</strong> Total power output is
              used to determine controller limits and expected heat generation. Ensure
              the total does not exceed the controller&apos;s maximum rated capacity.
            </p>
          </div>
        </Card>
      </div>

      {/* Template Save Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as Template</DialogTitle>
            <DialogDescription>
              Save the current controller information and channel configuration as a reusable template.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="templateName">Template Name *</Label>
              <Input
                id="templateName"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g., Standard LED Setup"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="templateDescription">Description</Label>
              <Textarea
                id="templateDescription"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Optional description..."
                className="mt-1.5"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowTemplateDialog(false);
                setTemplateName("");
                setTemplateDescription("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveAsTemplate}>Save Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ControllerSheet;
