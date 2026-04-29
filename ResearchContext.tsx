import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { BookOpen, ExternalLink, Loader2, Zap, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function ResearchContext({ moduleId }: { moduleId?: number }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    summary: "",
  });

  const { data: research, isLoading, refetch } = trpc.research.list.useQuery();

  const addResearchMutation = trpc.research.add.useMutation({
    onSuccess: () => {
      toast.success("Research reference added");
      setFormData({ title: "", url: "", summary: "" });
      setShowForm(false);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to add research: ${error.message}`);
    },
  });

  const handleAddResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.url.trim()) {
      toast.error("Title and URL are required");
      return;
    }

    await addResearchMutation.mutateAsync({
      title: formData.title,
      source: formData.url,
      summary: formData.summary,
    });
  };

  if (!moduleId) {
    return (
      <Card className="p-6 border-neon-cyan bg-card/50 text-center">
        <BookOpen className="w-8 h-8 mx-auto mb-2 text-neon-cyan/50" />
        <p className="text-sm text-muted-foreground">Select a module to view research context</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="border-b border-neon-cyan pb-3">
        <h3 className="text-neon-cyan font-mono font-bold text-lg">RESEARCH CONTEXT</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Relevant papers, articles, and resources for this module
        </p>
      </div>

      {/* Add Research Form */}
      {showForm ? (
        <Card className="p-4 border-neon-magenta bg-card">
          <h4 className="font-mono font-bold text-neon-magenta mb-3">ADD RESEARCH</h4>
          <form onSubmit={handleAddResearch} className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Graph Neural Networks: A Review"
                className="w-full bg-input border border-neon-cyan text-foreground rounded px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">URL</label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://..."
                className="w-full bg-input border border-neon-cyan text-foreground rounded px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Summary</label>
              <textarea
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                placeholder="Brief summary of the research..."
                className="w-full bg-input border border-neon-cyan text-foreground rounded px-3 py-2 text-sm"
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={addResearchMutation.isPending}
                className="flex-1 bg-neon-magenta hover:bg-neon-cyan text-background font-mono text-sm"
              >
                {addResearchMutation.isPending ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-3 h-3 mr-1" />
                    Add Reference
                  </>
                )}
              </Button>
              <Button
                type="button"
                onClick={() => setShowForm(false)}
                variant="outline"
                className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10 text-sm"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <Button
          onClick={() => setShowForm(true)}
          className="w-full bg-neon-magenta hover:bg-neon-cyan text-background font-mono font-bold"
        >
          <Plus className="w-4 h-4 mr-2" />
          ADD RESEARCH REFERENCE
        </Button>
      )}

      {/* Research List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 animate-spin text-neon-cyan" />
        </div>
      ) : research && research.length > 0 ? (
        <div className="space-y-2">
          {research.map((ref) => (
            <Card key={ref.id} className="p-3 border-neon-cyan bg-card/50 hover:bg-card/70 transition-all">
              <div className="flex items-start gap-3">
                <BookOpen className="w-4 h-4 text-neon-cyan flex-shrink-0 mt-1" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-mono font-bold text-foreground text-sm mb-1">{ref.title}</h4>
                  {ref.summary && (
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{ref.summary}</p>
                  )}
                  <a
                    href={ref.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-neon-cyan hover:text-neon-magenta transition-colors"
                  >
                    View Source
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-6 border-neon-cyan bg-card/50 text-center">
          <Zap className="w-8 h-8 mx-auto mb-2 text-neon-cyan/50" />
          <p className="text-sm text-muted-foreground">No research references yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Add relevant papers and articles to inform module development
          </p>
        </Card>
      )}
    </div>
  );
}
