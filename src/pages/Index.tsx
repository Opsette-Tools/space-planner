import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Plus, MoreHorizontal, Trash2, Copy, FolderOpen, FileJson, Upload, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { deleteLayout, genId, listLayouts, saveLayout } from "@/lib/storage";
import { downloadJSON, importJSON } from "@/lib/exporters";
import { TEMPLATES, buildLayoutFromTemplate, newEmptyLayout } from "@/lib/templates";
import { LAYOUT_TYPE_LABEL, type Layout, type LayoutType } from "@/lib/types";

const TYPE_OPTIONS: LayoutType[] = ["floor", "event", "garden", "seating", "general"];

export default function Index() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [layouts, setLayouts] = useState<Layout[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<LayoutType>("floor");
  const [pendingDelete, setPendingDelete] = useState<Layout | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = async () => {
    setLayouts(await listLayouts());
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleCreate = async () => {
    const layout = newEmptyLayout(name.trim() || "Untitled layout", type);
    await saveLayout(layout);
    navigate(`/editor/${layout.id}`);
  };

  const handleTemplate = async (templateId: string) => {
    const t = TEMPLATES.find((x) => x.id === templateId);
    if (!t) return;
    const layout = buildLayoutFromTemplate(t);
    await saveLayout(layout);
    navigate(`/editor/${layout.id}`);
  };

  const handleDuplicate = async (l: Layout) => {
    const copy: Layout = { ...l, id: genId(), name: `${l.name} (copy)`, createdAt: Date.now(), updatedAt: Date.now() };
    await saveLayout(copy);
    refresh();
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    await deleteLayout(pendingDelete.id);
    setPendingDelete(null);
    toast({ title: "Layout deleted" });
    refresh();
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const imported = await importJSON(file);
      const fresh: Layout = { ...imported, id: genId(), createdAt: Date.now(), updatedAt: Date.now() };
      await saveLayout(fresh);
      navigate(`/editor/${fresh.id}`);
    } catch {
      toast({ title: "Import failed", description: "Invalid layout file", variant: "destructive" });
    }
  };

  const groups = useMemo(() => {
    const g: Record<string, typeof TEMPLATES> = { Event: [], Landscape: [], Interior: [] };
    TEMPLATES.forEach((t) => g[t.group].push(t));
    return g;
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-lg font-semibold leading-tight">Planr</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">Spatial layout planner</p>
          </div>
          <input ref={fileRef} type="file" accept=".json,application/json" className="hidden" onChange={handleImport} />
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="hidden sm:inline-flex">
            <Upload className="w-4 h-4" /> Import
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4" /> New
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New layout</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="new-name">Name</Label>
                  <Input id="new-name" placeholder="My layout" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
                </div>
                <div className="space-y-1.5">
                  <Label>Type</Label>
                  <Select value={type} onValueChange={(v: LayoutType) => setType(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TYPE_OPTIONS.map((t) => (
                        <SelectItem key={t} value={t}>{LAYOUT_TYPE_LABEL[t]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-10">
        <section>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Your layouts</h2>
            <span className="text-xs text-muted-foreground">{layouts.length} saved</span>
          </div>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : layouts.length === 0 ? (
            <Card className="p-8 text-center border-dashed">
              <p className="text-sm text-muted-foreground mb-3">No layouts yet. Start fresh or pick a template below.</p>
              <Button onClick={() => setOpen(true)}><Plus className="w-4 h-4" /> New layout</Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {layouts.map((l) => (
                <Card key={l.id} className="overflow-hidden group hover:shadow-md transition cursor-pointer" onClick={() => navigate(`/editor/${l.id}`)}>
                  <div className="aspect-[4/3] bg-canvas border-b border-border overflow-hidden flex items-center justify-center">
                    {l.thumbnail ? (
                      <img src={l.thumbnail} alt={l.name} className="w-full h-full object-contain" />
                    ) : (
                      <LayoutGrid className="w-10 h-10 text-muted-foreground/30" />
                    )}
                  </div>
                  <div className="p-3 flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{l.name}</div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Badge variant="secondary" className="text-[10px] font-normal">{LAYOUT_TYPE_LABEL[l.type]}</Badge>
                        <span className="text-[11px] text-muted-foreground truncate">
                          {formatDistanceToNow(l.updatedAt, { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 -mr-1" onClick={(e) => e.stopPropagation()}>
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem onClick={() => navigate(`/editor/${l.id}`)}>
                          <FolderOpen className="w-4 h-4" /> Open
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(l)}>
                          <Copy className="w-4 h-4" /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => downloadJSON(l)}>
                          <FileJson className="w-4 h-4" /> Export JSON
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setPendingDelete(l)}
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">Start from a template</h2>
          {(["Event", "Landscape", "Interior"] as const).map((g) => (
            <div key={g} className="mb-5">
              <div className="text-xs font-medium text-muted-foreground mb-2">{g}</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {groups[g].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleTemplate(t.id)}
                    className="text-left p-4 rounded-lg border border-border bg-card hover:border-accent hover:shadow-sm transition active:scale-[0.98]"
                  >
                    <div className="font-medium text-sm">{t.name}</div>
                    <div className="text-[11px] text-muted-foreground mt-1">{LAYOUT_TYPE_LABEL[t.type]}</div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </section>

        <footer className="text-center text-xs text-muted-foreground pt-4 pb-8">
          Layouts are saved locally on this device.
        </footer>
      </main>

      <AlertDialog open={!!pendingDelete} onOpenChange={(v) => !v && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete layout?</AlertDialogTitle>
            <AlertDialogDescription>
              "{pendingDelete?.name}" will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
