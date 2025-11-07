import { useState } from "react";
import ControllerSheet from "@/components/ControllerSheet";
import Dashboard from "@/components/Dashboard";
import FixtureConfigManager from "@/components/FixtureConfigManager";
import { ControllerData } from "@/lib/controllerStorage";

const Index = () => {
  const [view, setView] = useState<"dashboard" | "editor" | "fixtures">("dashboard");
  const [editingController, setEditingController] = useState<ControllerData | undefined>(
    undefined
  );

  const handleCreateNew = () => {
    setEditingController(undefined);
    setView("editor");
  };

  const handleEditController = (controller: ControllerData) => {
    setEditingController(controller);
    setView("editor");
  };

  const handleBackToDashboard = () => {
    setEditingController(undefined);
    setView("dashboard");
  };

  const handleOpenFixtures = () => {
    setView("fixtures");
  };

  return (
    <>
      {view === "dashboard" ? (
        <Dashboard
          onCreateNew={handleCreateNew}
          onEditController={handleEditController}
          onOpenFixtures={handleOpenFixtures}
        />
      ) : view === "fixtures" ? (
        <FixtureConfigManager onBack={handleBackToDashboard} />
      ) : (
        <ControllerSheet
          initialData={editingController}
          onBack={handleBackToDashboard}
        />
      )}
    </>
  );
};

export default Index;
