import { useMemo } from "react";
import { Button, Empty, Select, Space, Tag, Typography } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import type { DetectedShape } from "@/lib/detectShapes";
import { LIBRARY } from "@/lib/objectLibrary";

const { Text } = Typography;

/** One detected shape + the library type the user has chosen for it. */
export interface TypedDetection extends DetectedShape {
  chosenType: string;
}

interface Props {
  detections: TypedDetection[];
  /** Called when the user changes the type for every detection that
   *  currently has `oldType`. Bulk-retype is the primary interaction. */
  onBulkRetype: (oldType: string, newType: string) => void;
  onCommit: () => void;
  onCancel: () => void;
}

/** Library types grouped in the dropdown, ordered from "most likely useful
 *  for detection results" to "less common." */
const TYPE_OPTIONS = LIBRARY.map((d) => ({
  value: d.type,
  label: d.label,
  category: d.category,
}));

/** Right-side panel shown when a detection result is pending. Groups
 *  detections by their current chosen type so the user can bulk-retype a
 *  whole group with one dropdown. */
export function DetectionBar({
  detections,
  onBulkRetype,
  onCommit,
  onCancel,
}: Props) {
  const groups = useMemo(() => {
    const m = new Map<string, TypedDetection[]>();
    for (const d of detections) {
      const list = m.get(d.chosenType) ?? [];
      list.push(d);
      m.set(d.chosenType, list);
    }
    // Preserve the library's declared order so groups feel stable between runs.
    return Array.from(m.entries()).sort((a, b) => {
      const ai = LIBRARY.findIndex((def) => def.type === a[0]);
      const bi = LIBRARY.findIndex((def) => def.type === b[0]);
      return ai - bi;
    });
  }, [detections]);

  const panel = (
    <div
      style={{
        position: "absolute",
        top: 12,
        right: 12,
        width: 300,
        maxHeight: "calc(100% - 24px)",
        display: "flex",
        flexDirection: "column",
        background: "#ffffff",
        border: "1px solid #eaedf1",
        borderRadius: 10,
        boxShadow: "0 4px 20px rgba(15,23,42,0.12)",
        zIndex: 20,
      }}
    >
      <div
        style={{
          padding: "10px 14px",
          borderBottom: "1px solid #eaedf1",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text strong style={{ fontSize: 13 }}>
          Detected shapes
        </Text>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {detections.length}
        </Text>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 10px" }}>
        {detections.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Text type="secondary" style={{ fontSize: 12 }}>
                No clear shapes detected. Try a higher-contrast image.
              </Text>
            }
          />
        ) : (
          <Space direction="vertical" size={8} style={{ width: "100%" }}>
            {groups.map(([type, list]) => {
              const def = LIBRARY.find((d) => d.type === type);
              const label = def?.label ?? type;
              return (
                <div
                  key={type}
                  style={{
                    border: "1px solid #eef0f3",
                    borderRadius: 8,
                    padding: "8px 10px",
                    background: "#fafbfc",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 6,
                    }}
                  >
                    <Space size={6} align="center">
                      <Text strong style={{ fontSize: 12 }}>
                        {label}
                      </Text>
                      <Tag style={{ margin: 0, fontSize: 10, lineHeight: "16px", padding: "0 5px" }}>
                        {list.length}
                      </Tag>
                    </Space>
                  </div>
                  <Select
                    size="small"
                    value={type}
                    onChange={(v) => onBulkRetype(type, v)}
                    style={{ width: "100%" }}
                    showSearch
                    optionFilterProp="label"
                    options={TYPE_OPTIONS}
                  />
                </div>
              );
            })}
          </Space>
        )}
      </div>
      <div
        style={{
          padding: "10px 14px",
          borderTop: "1px solid #eaedf1",
          display: "flex",
          gap: 8,
        }}
      >
        <Button icon={<CloseOutlined />} onClick={onCancel} style={{ flex: 1 }}>
          Cancel
        </Button>
        <Button
          type="primary"
          icon={<CheckOutlined />}
          onClick={onCommit}
          disabled={detections.length === 0}
          style={{ flex: 2 }}
        >
          Add {detections.length}
        </Button>
      </div>
    </div>
  );

  return panel;
}
