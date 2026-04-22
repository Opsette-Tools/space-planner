import { useRef, useState } from "react";
import { Button, Popover, Slider, Space, Switch, Tooltip, Typography } from "antd";
import {
  DeleteOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  FileImageOutlined,
  LockOutlined,
  ScanOutlined,
  SwapOutlined,
  UnlockOutlined,
} from "@ant-design/icons";
import type { ReferenceImage } from "@/lib/types";
import { REFERENCE_ACCEPT } from "@/lib/referenceImport";

const { Text } = Typography;

interface Props {
  reference: ReferenceImage | null;
  onChange: (patch: Partial<ReferenceImage>) => void;
  onReplace: (file: File) => void;
  onRemove: () => void;
  onImport: (file: File) => void;
  onDetect: () => void;
  detecting: boolean;
  /** When true, the Detect button is disabled — typically because a
   *  detection preview is already on screen awaiting confirm/cancel. */
  detectDisabled?: boolean;
}

/** Small "Reference" pill that lives in the editor top bar. Opens a popover
 *  with opacity/visibility/lock controls when a reference is active. If no
 *  reference is set, clicking the pill triggers a file picker instead. */
export function ReferenceControls({
  reference,
  onChange,
  onReplace,
  onRemove,
  onImport,
  onDetect,
  detecting,
  detectDisabled = false,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const replaceRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (f) onImport(f);
  };

  const handleReplace = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (f) onReplace(f);
  };

  // No reference → button acts as importer.
  if (!reference) {
    return (
      <>
        <input
          ref={fileRef}
          type="file"
          accept={REFERENCE_ACCEPT}
          style={{ display: "none" }}
          onChange={handleImport}
        />
        <Tooltip title="Trace over an image or PDF">
          <Button
            type="text"
            size="small"
            icon={<FileImageOutlined />}
            onClick={() => fileRef.current?.click()}
          >
            Reference
          </Button>
        </Tooltip>
      </>
    );
  }

  const content = (
    <div style={{ width: 240 }}>
      <Space direction="vertical" size={10} style={{ width: "100%" }}>
        <div>
          <Text style={{ fontSize: 11, color: "#64748b" }}>Opacity</Text>
          <Slider
            min={0.05}
            max={1}
            step={0.05}
            value={reference.opacity}
            onChange={(v) => onChange({ opacity: v as number })}
            tooltip={{
              formatter: (v) => (v != null ? `${Math.round(Number(v) * 100)}%` : ""),
            }}
          />
        </div>
        <div
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
        >
          <Space size={6}>
            {reference.visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
            <Text style={{ fontSize: 13 }}>Visible</Text>
          </Space>
          <Switch
            size="small"
            checked={reference.visible}
            onChange={(v) => onChange({ visible: v })}
          />
        </div>
        <div
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
        >
          <Space size={6}>
            {reference.locked ? <LockOutlined /> : <UnlockOutlined />}
            <Text style={{ fontSize: 13 }}>Locked</Text>
          </Space>
          <Switch
            size="small"
            checked={reference.locked}
            onChange={(v) => onChange({ locked: v })}
          />
        </div>
        {!reference.locked && (
          <Text type="secondary" style={{ fontSize: 11, lineHeight: 1.4, display: "block" }}>
            Drag the image to move it, or drag the corner handle to resize.
          </Text>
        )}
        <Button
          size="small"
          icon={<ScanOutlined />}
          loading={detecting}
          disabled={detectDisabled}
          onClick={() => {
            setOpen(false);
            onDetect();
          }}
          block
        >
          Detect shapes
        </Button>
        <div style={{ display: "flex", gap: 6 }}>
          <input
            ref={replaceRef}
            type="file"
            accept={REFERENCE_ACCEPT}
            style={{ display: "none" }}
            onChange={handleReplace}
          />
          <Button
            size="small"
            icon={<SwapOutlined />}
            onClick={() => replaceRef.current?.click()}
            style={{ flex: 1 }}
          >
            Replace
          </Button>
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={onRemove}
            style={{ flex: 1 }}
          >
            Remove
          </Button>
        </div>
      </Space>
    </div>
  );

  return (
    <Popover
      content={content}
      title="Reference image"
      trigger="click"
      placement="bottomRight"
      open={open}
      onOpenChange={setOpen}
    >
      <Button
        type="default"
        size="small"
        icon={<FileImageOutlined />}
        style={{
          borderRadius: 999,
          fontSize: 12,
          height: 26,
          padding: "0 10px",
        }}
      >
        Reference
      </Button>
    </Popover>
  );
}
