import { Button, Space, Typography } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import type { DetectedShape } from "@/lib/detectShapes";

const { Text } = Typography;

interface Props {
  shapes: DetectedShape[];
  rectCount: number;
  circleCount: number;
  onCommit: () => void;
  onCancel: () => void;
}

/** Confirmation bar shown over the canvas while a detection result is
 *  pending. The actual shape outlines are rendered inside Canvas itself via
 *  the `previewShapes` prop so they're positioned in canvas space (not
 *  viewport space) and move with pan/zoom. */
export function DetectionBar({
  shapes,
  rectCount,
  circleCount,
  onCommit,
  onCancel,
}: Props) {
  if (shapes.length === 0) {
    return (
      <div
        style={{
          position: "absolute",
          top: 12,
          left: "50%",
          transform: "translateX(-50%)",
          background: "#ffffff",
          border: "1px solid #eaedf1",
          borderRadius: 999,
          padding: "8px 14px",
          boxShadow: "0 2px 12px rgba(15,23,42,0.12)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          zIndex: 20,
        }}
      >
        <Text style={{ fontSize: 13 }}>
          No clear shapes detected. Try a higher-contrast image, or trace
          manually.
        </Text>
        <Button size="small" icon={<CloseOutlined />} onClick={onCancel}>
          Dismiss
        </Button>
      </div>
    );
  }

  const parts: string[] = [];
  if (rectCount > 0) parts.push(`${rectCount} rectangle${rectCount === 1 ? "" : "s"}`);
  if (circleCount > 0) parts.push(`${circleCount} circle${circleCount === 1 ? "" : "s"}`);

  return (
    <div
      style={{
        position: "absolute",
        top: 12,
        left: "50%",
        transform: "translateX(-50%)",
        background: "#ffffff",
        border: "1px solid #eaedf1",
        borderRadius: 999,
        padding: "6px 6px 6px 14px",
        boxShadow: "0 2px 12px rgba(15,23,42,0.12)",
        display: "flex",
        alignItems: "center",
        gap: 10,
        zIndex: 20,
      }}
    >
      <Text style={{ fontSize: 13 }}>
        Found <Text strong>{parts.join(" + ")}</Text>
      </Text>
      <Space size={4}>
        <Button size="small" icon={<CloseOutlined />} onClick={onCancel}>
          Cancel
        </Button>
        <Button
          size="small"
          type="primary"
          icon={<CheckOutlined />}
          onClick={onCommit}
        >
          Add all
        </Button>
      </Space>
    </div>
  );
}
