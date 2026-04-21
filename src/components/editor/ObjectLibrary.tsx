import { useMemo, useState } from "react";
import { Input, Tabs, Empty, Typography } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { LIBRARY, type LibraryDef } from "@/lib/objectLibrary";
import { CATEGORY_LABEL, type ItemCategory } from "@/lib/types";
import { ObjectPreview } from "./ObjectPreview";

const { Text } = Typography;

interface Props {
  onPick: (def: LibraryDef) => void;
}

const ORDER: ItemCategory[] = ["rooms", "furniture", "event", "landscape", "structural", "labels"];

function Grid({ defs, onPick }: { defs: LibraryDef[]; onPick: (d: LibraryDef) => void }) {
  if (defs.length === 0) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No matches" style={{ marginTop: 24 }} />;
  }
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))",
        gap: 6,
        padding: "8px 10px 16px",
      }}
    >
      {defs.map((d) => (
        <button
          key={d.type}
          onClick={() => onPick(d)}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            padding: "6px 4px",
            minHeight: 68,
            background: "#ffffff",
            border: "1px solid #eaedf1",
            borderRadius: 6,
            cursor: "pointer",
            transition: "border-color 0.1s, box-shadow 0.1s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#243958";
            e.currentTarget.style.boxShadow = "0 1px 3px rgba(36, 57, 88, 0.12)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#eaedf1";
            e.currentTarget.style.boxShadow = "none";
          }}
          title={d.label}
        >
          <ObjectPreview def={d} size={32} />
          <Text
            style={{
              fontSize: 10,
              lineHeight: 1.2,
              textAlign: "center",
              width: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {d.label}
          </Text>
        </button>
      ))}
    </div>
  );
}

export function ObjectLibrary({ onPick }: Props) {
  const [query, setQuery] = useState("");

  const grouped = useMemo(() => {
    const m = new Map<ItemCategory, LibraryDef[]>();
    LIBRARY.forEach((d) => {
      const arr = m.get(d.category) ?? [];
      arr.push(d);
      m.set(d.category, arr);
    });
    return m;
  }, []);

  const q = query.trim().toLowerCase();
  const filter = (defs: LibraryDef[]) =>
    q ? defs.filter((d) => d.label.toLowerCase().includes(q) || d.type.toLowerCase().includes(q)) : defs;

  const items = ORDER.map((c) => ({
    key: c,
    label: CATEGORY_LABEL[c],
    children: <Grid defs={filter(grouped.get(c) ?? [])} onPick={onPick} />,
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <div style={{ padding: "8px 10px 0" }}>
        <Input
          size="small"
          allowClear
          prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
          placeholder="Search objects"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <Tabs
        defaultActiveKey="rooms"
        size="small"
        items={items}
        tabBarStyle={{ margin: 0, padding: "0 10px" }}
        style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}
        className="library-tabs"
      />
      <style>{`
        .library-tabs .ant-tabs-content-holder { overflow-y: auto; }
      `}</style>
    </div>
  );
}
