import {
  Button,
  ColorPicker,
  Input,
  InputNumber,
  Select,
  Slider,
  Space,
  Switch,
  Typography,
} from "antd";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CopyOutlined,
  DeleteOutlined,
  LockOutlined,
  UnlockOutlined,
} from "@ant-design/icons";
import type { BorderStyle, LayoutItem } from "@/lib/types";

const { Text } = Typography;
const { TextArea } = Input;

const SWATCHES = [
  "#e8e3d6",
  "#c8d3e0",
  "#d8cce8",
  "#cee0c8",
  "#bcd9e8",
  "#ffd766",
  "#fff8d8",
  "#f5b8b8",
  "#d8d0c0",
  "#ffffff",
  "#1a1a1a",
  "#888888",
];

interface Props {
  item: LayoutItem;
  onChange: (patch: Partial<LayoutItem>) => void;
  onStyleChange: (patch: Partial<LayoutItem["style"]>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onForward: () => void;
  onBackward: () => void;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{
        display: "block",
        fontSize: 11,
        fontWeight: 500,
        color: "#64748b",
        marginBottom: 4,
      }}
    >
      {children}
    </Text>
  );
}

export function Inspector({
  item,
  onChange,
  onStyleChange,
  onDuplicate,
  onDelete,
  onForward,
  onBackward,
}: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: 14 }}>
      <div>
        <FieldLabel>Label</FieldLabel>
        <Input
          size="small"
          value={item.label}
          onChange={(e) => onChange({ label: e.target.value })}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div>
          <FieldLabel>Width</FieldLabel>
          <InputNumber
            size="small"
            value={Math.round(item.width)}
            min={4}
            style={{ width: "100%" }}
            onChange={(v) => onChange({ width: Math.max(4, Number(v) || 0) })}
          />
        </div>
        <div>
          <FieldLabel>Height</FieldLabel>
          <InputNumber
            size="small"
            value={Math.round(item.height)}
            min={4}
            style={{ width: "100%" }}
            onChange={(v) => onChange({ height: Math.max(4, Number(v) || 0) })}
          />
        </div>
        <div>
          <FieldLabel>X</FieldLabel>
          <InputNumber
            size="small"
            value={Math.round(item.x)}
            style={{ width: "100%" }}
            onChange={(v) => onChange({ x: Number(v) || 0 })}
          />
        </div>
        <div>
          <FieldLabel>Y</FieldLabel>
          <InputNumber
            size="small"
            value={Math.round(item.y)}
            style={{ width: "100%" }}
            onChange={(v) => onChange({ y: Number(v) || 0 })}
          />
        </div>
      </div>

      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <FieldLabel>Rotation</FieldLabel>
          <InputNumber
            size="small"
            value={Math.round(item.rotation)}
            style={{ width: 76 }}
            onChange={(v) => onChange({ rotation: Number(v) || 0 })}
          />
        </div>
        <Slider
          value={item.rotation}
          min={-180}
          max={180}
          step={1}
          onChange={(v) => onChange({ rotation: v })}
        />
      </div>

      <div>
        <FieldLabel>Fill</FieldLabel>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {SWATCHES.map((c) => (
            <button
              key={c}
              onClick={() => onStyleChange({ fill: c })}
              aria-label={`Fill ${c}`}
              style={{
                width: 24,
                height: 24,
                borderRadius: 5,
                border: "1px solid #d9dde3",
                background: c,
                outline: item.style.fill === c ? "2px solid #243958" : "none",
                outlineOffset: 1,
                cursor: "pointer",
              }}
            />
          ))}
          <ColorPicker
            size="small"
            value={item.style.fill}
            onChange={(c) => onStyleChange({ fill: c.toHexString() })}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div>
          <FieldLabel>Border</FieldLabel>
          <Select
            size="small"
            value={item.style.strokeStyle}
            style={{ width: "100%" }}
            onChange={(v: BorderStyle) => onStyleChange({ strokeStyle: v })}
            options={[
              { value: "solid", label: "Solid" },
              { value: "dashed", label: "Dashed" },
              { value: "none", label: "None" },
            ]}
          />
        </div>
        <div>
          <FieldLabel>Stroke</FieldLabel>
          <ColorPicker
            size="small"
            value={item.style.stroke}
            onChange={(c) => onStyleChange({ stroke: c.toHexString() })}
          />
        </div>
      </div>

      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <FieldLabel>Opacity</FieldLabel>
          <Text type="secondary" style={{ fontSize: 11 }}>
            {Math.round(item.style.opacity * 100)}%
          </Text>
        </div>
        <Slider
          value={Math.round(item.style.opacity * 100)}
          min={10}
          max={100}
          step={1}
          onChange={(v) => onStyleChange({ opacity: v / 100 })}
        />
      </div>

      <div>
        <FieldLabel>Notes</FieldLabel>
        <TextArea
          rows={3}
          value={item.notes ?? ""}
          onChange={(e) => onChange({ notes: e.target.value })}
        />
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 12px",
          border: "1px solid #eaedf1",
          borderRadius: 8,
        }}
      >
        <Space size={8}>
          {item.locked ? <LockOutlined /> : <UnlockOutlined />}
          <Text style={{ fontSize: 13 }}>Lock position</Text>
        </Space>
        <Switch
          size="small"
          checked={item.locked}
          onChange={(v) => onChange({ locked: v })}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <Button size="small" icon={<ArrowUpOutlined />} onClick={onForward}>
          Forward
        </Button>
        <Button size="small" icon={<ArrowDownOutlined />} onClick={onBackward}>
          Backward
        </Button>
        <Button size="small" icon={<CopyOutlined />} onClick={onDuplicate}>
          Duplicate
        </Button>
        <Button size="small" danger icon={<DeleteOutlined />} onClick={onDelete}>
          Delete
        </Button>
      </div>
    </div>
  );
}
