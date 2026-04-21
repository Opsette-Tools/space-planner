import { useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LIBRARY, type LibraryDef } from "@/lib/objectLibrary";
import { CATEGORY_LABEL, type ItemCategory } from "@/lib/types";
import { ObjectPreview } from "./ObjectPreview";

interface Props {
  onPick: (def: LibraryDef) => void;
}

const ORDER: ItemCategory[] = ["rooms", "furniture", "event", "landscape", "structural", "labels"];

export function ObjectLibrary({ onPick }: Props) {
  const grouped = useMemo(() => {
    const m = new Map<ItemCategory, LibraryDef[]>();
    LIBRARY.forEach((d) => {
      const arr = m.get(d.category) ?? [];
      arr.push(d);
      m.set(d.category, arr);
    });
    return m;
  }, []);

  return (
    <Tabs defaultValue="rooms" className="flex flex-col h-full">
      <ScrollArea className="w-full">
        <TabsList className="w-max mx-2 my-2">
          {ORDER.map((c) => (
            <TabsTrigger key={c} value={c} className="text-xs">
              {CATEGORY_LABEL[c]}
            </TabsTrigger>
          ))}
        </TabsList>
      </ScrollArea>
      {ORDER.map((c) => (
        <TabsContent key={c} value={c} className="flex-1 mt-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 gap-2 p-3">
              {(grouped.get(c) ?? []).map((d) => (
                <button
                  key={d.type}
                  onClick={() => onPick(d)}
                  className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg border border-border bg-card hover:border-accent hover:shadow-sm transition active:scale-95 min-h-[80px]"
                >
                  <ObjectPreview def={d} />
                  <span className="text-[11px] text-foreground text-center leading-tight line-clamp-2">{d.label}</span>
                </button>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      ))}
    </Tabs>
  );
}