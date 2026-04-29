import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Activity, Zap, Radio, Eye } from "lucide-react";
import { useState } from "react";

const MODULE_ICONS = {
  GNN: Activity,
  Resonance: Radio,
  "Embodied Reality": Eye,
};

const MODULE_COLORS = {
  GNN: "border-neon-cyan",
  Resonance: "border-neon-magenta",
  "Embodied Reality": "border-neon-green",
};

export function ModuleMap() {
  const { data: modules, isLoading } = trpc.module.list.useQuery();
  const [selectedModule, setSelectedModule] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Zap className="w-6 h-6 animate-spin text-neon-cyan" />
      </div>
    );
  }

  const coreModules = ["GNN", "Resonance", "Embodied Reality"];
  const displayModules = modules?.filter((m) => coreModules.includes(m.name)) || [];

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="border-b border-neon-cyan pb-3">
        <h3 className="text-neon-cyan font-mono font-bold text-lg">MODULAR TOPOLOGY</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Three-tier scaffolding system with autonomous assembly capabilities
        </p>
      </div>

      {/* Module Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {coreModules.map((moduleName) => {
          const module = displayModules.find((m) => m.name === moduleName);
          const Icon = MODULE_ICONS[moduleName as keyof typeof MODULE_ICONS];
          const colorClass = MODULE_COLORS[moduleName as keyof typeof MODULE_COLORS];

          return (
            <Card
              key={moduleName}
              className={`p-4 cursor-pointer transition-all ${colorClass} border-2 ${
                selectedModule === module?.id
                  ? "bg-card/80 shadow-neon-cyan"
                  : "bg-card hover:bg-card/80"
              }`}
              onClick={() => setSelectedModule(module?.id || null)}
            >
              {/* Header */}
              <div className="flex items-center gap-2 mb-3">
                <Icon className="w-5 h-5 text-neon-cyan" />
                <h4 className="font-mono font-bold text-foreground">{moduleName}</h4>
              </div>

              {/* Status */}
              {module ? (
                <>
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge
                        variant={
                          module.status === "active"
                            ? "default"
                            : module.status === "processing"
                            ? "secondary"
                            : "outline"
                        }
                        className="text-xs"
                      >
                        {module.status}
                      </Badge>
                    </div>
                    {module.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {module.description}
                      </p>
                    )}
                  </div>

                  {/* Dependencies */}
                  {module.dependencies && module.dependencies.length > 0 && (
                    <div className="border-t border-neon-cyan/20 pt-2">
                      <p className="text-xs font-mono text-neon-cyan mb-1">Dependencies:</p>
                      <div className="flex flex-wrap gap-1">
                        {module.dependencies.map((dep) => (
                          <Badge key={dep} variant="outline" className="text-xs">
                            {dep}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-xs text-muted-foreground italic">
                  Module not yet initialized. Create to activate.
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Connection Diagram */}
      <Card className="p-4 border-neon-magenta bg-card/50">
        <h4 className="font-mono font-bold text-neon-magenta mb-3 text-sm">SIGNAL FLOW</h4>
        <div className="space-y-2 text-xs font-mono">
          <div className="text-neon-cyan">
            GNN <span className="text-muted-foreground">→</span> Resonance
            <span className="text-muted-foreground">: topology propagation</span>
          </div>
          <div className="text-neon-magenta">
            Resonance <span className="text-muted-foreground">→</span> Embodied Reality
            <span className="text-muted-foreground">: harmonic grounding</span>
          </div>
          <div className="text-neon-green">
            Embodied Reality <span className="text-muted-foreground">→</span> GNN
            <span className="text-muted-foreground">: feedback loop</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
