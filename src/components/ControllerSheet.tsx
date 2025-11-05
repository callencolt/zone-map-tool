import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, FileText } from "lucide-react";

interface Channel {
  id: string;
  channelNumber: number;
  fixtureType: string;
  voltage: string;
  current: string;
}

const ControllerSheet = () => {
  const [campus, setCampus] = useState("");
  const [building, setBuilding] = useState("");
  const [floor, setFloor] = useState("");
  const [zone, setZone] = useState("");
  const [controllerNumber, setControllerNumber] = useState("");
  const [channels, setChannels] = useState<Channel[]>([
    { id: "1", channelNumber: 1, fixtureType: "", voltage: "", current: "" },
  ]);

  const addChannel = () => {
    const newChannelNumber = channels.length > 0 
      ? Math.max(...channels.map(c => c.channelNumber)) + 1 
      : 1;
    setChannels([
      ...channels,
      {
        id: Date.now().toString(),
        channelNumber: newChannelNumber,
        fixtureType: "",
        voltage: "",
        current: "",
      },
    ]);
  };

  const removeChannel = (id: string) => {
    setChannels(channels.filter((channel) => channel.id !== id));
  };

  const updateChannel = (id: string, field: keyof Channel, value: string) => {
    setChannels(
      channels.map((channel) =>
        channel.id === id ? { ...channel, [field]: value } : channel
      )
    );
  };

  const calculatePower = (voltage: string, current: string): number => {
    const v = parseFloat(voltage) || 0;
    const a = parseFloat(current) || 0;
    return v * a;
  };

  const getTotalPower = (): number => {
    return channels.reduce((total, channel) => {
      return total + calculatePower(channel.voltage, channel.current);
    }, 0);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <Card className="p-6 md:p-8 shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  Controller Documentation Sheet
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Record controller specifications and channel configurations
                </p>
              </div>
            </div>
            <Button onClick={handlePrint} variant="outline" className="hidden md:flex gap-2 print:hidden">
              <FileText className="h-4 w-4" />
              Print
            </Button>
          </div>

          {/* Controller Information */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="h-1 w-8 bg-primary rounded"></span>
              Controller Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <Label htmlFor="campus" className="text-sm font-medium">
                  Campus
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
                  Building
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
                  Controller #
                </Label>
                <Input
                  id="controllerNumber"
                  value={controllerNumber}
                  onChange={(e) => setControllerNumber(e.target.value)}
                  placeholder="Enter number"
                  className="mt-1.5"
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
              <Button
                onClick={addChannel}
                size="sm"
                className="gap-2 print:hidden"
              >
                <Plus className="h-4 w-4" />
                Add Channel
              </Button>
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
                          Power (W)
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-foreground uppercase tracking-wider print:hidden">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                      {channels.map((channel) => {
                        const power = calculatePower(channel.voltage, channel.current);
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
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-foreground">
                              {power > 0 ? power.toFixed(2) : "—"}
                            </td>
                            <td className="px-4 py-3 text-right print:hidden">
                              <Button
                                onClick={() => removeChannel(channel.id)}
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                disabled={channels.length === 1}
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
                        <td colSpan={4} className="px-4 py-3 text-right text-sm font-semibold text-foreground">
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
              <strong className="text-foreground">Note:</strong> Total power output is used to determine controller limits and expected heat generation. Ensure the total does not exceed the controller's maximum rated capacity.
            </p>
          </div>
        </Card>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ControllerSheet;
