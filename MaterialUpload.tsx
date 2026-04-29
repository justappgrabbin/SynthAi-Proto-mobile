import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Upload, File, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface UploadedFile {
  name: string;
  type: string;
  size: number;
  mappedModules: string[];
  status: "pending" | "uploading" | "success" | "error";
}

export function MaterialUpload({ conversationId }: { conversationId?: number }) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ingestMaterialMutation = trpc.material.ingest.useMutation({
    onSuccess: (data) => {
      setFiles((prev) =>
        prev.map((f) =>
          f.name === data.materialId?.toString()
            ? { ...f, status: "success", mappedModules: data.mappedModules }
            : f
        )
      );
      toast.success(`Material ingested: ${data.mappedModules.join(", ")}`);
    },
    onError: (error) => {
      toast.error(`Ingestion failed: ${error.message}`);
      setFiles((prev) => prev.map((f) => (f.status === "uploading" ? { ...f, status: "error" } : f)));
    },
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const processFiles = async (fileList: FileList) => {
    const newFiles: UploadedFile[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const reader = new FileReader();

      reader.onload = async (e) => {
        const content = e.target?.result as string;
        const fileType = file.type || "text/plain";

        // Add to pending list
        const uploadedFile: UploadedFile = {
          name: file.name,
          type: fileType,
          size: file.size,
          mappedModules: [],
          status: "uploading",
        };

        setFiles((prev) => [...prev, uploadedFile]);

        // Ingest material
        try {
          await ingestMaterialMutation.mutateAsync({
            fileName: file.name,
            fileType: fileType,
            content: content.substring(0, 50000), // Limit to 50KB for API
            conversationId,
          });
        } catch (error) {
          console.error("Failed to ingest material:", error);
        }
      };

      reader.readAsText(file);
      newFiles.push({
        name: file.name,
        type: file.type,
        size: file.size,
        mappedModules: [],
        status: "pending",
      });
    }
  };

  const clearFiles = () => {
    setFiles([]);
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <Card
        className={`border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? "border-neon-magenta bg-neon-magenta/10 shadow-neon-magenta"
            : "border-neon-cyan bg-card hover:border-neon-magenta"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
              accept=".ts,.tsx,.js,.jsx,.py,.md,.txt,.json,.yaml,.yml,.sql,.pdf,.epub,.mobi"
        />
        <Upload className="w-8 h-8 mx-auto mb-2 text-neon-cyan" />
        <h3 className="font-mono font-bold text-neon-cyan mb-1">DROP MATERIALS HERE</h3>
        <p className="text-xs text-muted-foreground">
          Code files, docs, notes, or any scaffolding material
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Supports: Code (.ts, .tsx, .js, .jsx, .py), Docs (.md, .txt, .json, .yaml, .sql), Books (.pdf, .epub, .mobi)
        </p>
      </Card>

      {/* File list */}
      {files.length > 0 && (
        <Card className="p-4 border-neon-cyan bg-card/50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-mono font-bold text-neon-cyan text-sm">INGESTED MATERIALS</h4>
            <Button
              onClick={clearFiles}
              variant="outline"
              className="text-xs border-neon-magenta text-neon-magenta hover:bg-neon-magenta/10"
            >
              Clear
            </Button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {files.map((file, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 bg-card/50 rounded border border-neon-cyan/20">
                {file.status === "uploading" && (
                  <Loader2 className="w-4 h-4 animate-spin text-neon-cyan flex-shrink-0" />
                )}
                {file.status === "success" && (
                  <CheckCircle className="w-4 h-4 text-neon-green flex-shrink-0" />
                )}
                {file.status === "error" && (
                  <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                )}
                {file.status === "pending" && (
                  <File className="w-4 h-4 text-neon-cyan flex-shrink-0" />
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-foreground truncate">{file.name}</p>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {file.mappedModules.length > 0 ? (
                      file.mappedModules.map((mod) => (
                        <Badge key={mod} variant="outline" className="text-xs">
                          {mod}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {file.status === "uploading" ? "Mapping..." : "No modules"}
                      </span>
                    )}
                  </div>
                </div>

                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Info */}
      <div className="text-xs text-muted-foreground border-l-2 border-neon-cyan pl-3">
        <p>
          Materials are automatically analyzed and mapped to your modules (GNN, Resonance, Embodied Reality).
        </p>
        <p className="mt-1">
          The orchestrator uses AI to understand your code structure and suggest optimal placement.
        </p>
      </div>
    </div>
  );
}
