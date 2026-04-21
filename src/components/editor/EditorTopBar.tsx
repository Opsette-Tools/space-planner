import { useState } from "react";
import { Button, Dropdown, Input, Space, Tooltip, Typography } from "antd";
import type { MenuProps } from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CopyOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EllipsisOutlined,
  FileImageOutlined,
  LoadingOutlined,
  RedoOutlined,
  SaveOutlined,
  SyncOutlined,
  UndoOutlined,
  UploadOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

interface Props {
  name: string;
  onNameChange: (n: string) => void;
  onBack: () => void;
  saving: boolean;
  dirty: boolean;
  manualSave: boolean;
  /** True until the layout has been persisted to storage for the first time. */
  unsaved?: boolean;
  onSave: () => void;
  onToggleManualSave: () => void;
  zoomPct: number;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onExportJSON: () => void;
  onExportPNG: () => void;
  onImportJSON: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function EditorTopBar({
  name,
  onNameChange,
  onBack,
  saving,
  dirty,
  manualSave,
  unsaved = false,
  onSave,
  onToggleManualSave,
  zoomPct,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onExportJSON,
  onExportPNG,
  onImportJSON,
  onDuplicate,
  onDelete,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);

  const savedOnlyLabel = "Save this layout first";

  const menu: MenuProps = {
    items: [
      {
        key: "auto-save",
        icon: <SyncOutlined />,
        label: manualSave ? "Turn on auto-save" : "Turn off auto-save",
        disabled: unsaved,
        onClick: onToggleManualSave,
      },
      { type: "divider" },
      {
        key: "duplicate",
        icon: <CopyOutlined />,
        label: "Duplicate",
        disabled: unsaved,
        onClick: onDuplicate,
      },
      { type: "divider" },
      {
        key: "png",
        icon: <FileImageOutlined />,
        label: "Export PNG",
        onClick: onExportPNG,
      },
      {
        key: "json",
        icon: <DownloadOutlined />,
        label: "Export JSON",
        disabled: unsaved,
        onClick: onExportJSON,
      },
      { key: "import", icon: <UploadOutlined />, label: "Import JSON", onClick: onImportJSON },
      { type: "divider" },
      {
        key: "delete",
        icon: <DeleteOutlined />,
        label: "Delete",
        danger: true,
        disabled: unsaved,
        onClick: onDelete,
      },
    ],
  };

  // Status label — differs by mode
  const statusLabel = (() => {
    if (saving) return <Space size={4}><LoadingOutlined /> Saving</Space>;
    if (unsaved) {
      return (
        <Space size={4}>
          <span style={{ color: "#d97706" }}>●</span> Draft · unsaved
        </Space>
      );
    }
    if (manualSave) {
      if (dirty) return <Space size={4}><span style={{ color: "#d97706" }}>●</span> Unsaved</Space>;
      return <Space size={4}><CheckCircleOutlined /> Saved</Space>;
    }
    return <Space size={4}><CheckCircleOutlined /> Auto-saved</Space>;
  })();

  return (
    <header
      style={{
        height: 52,
        flexShrink: 0,
        background: "#ffffff",
        borderBottom: "1px solid #eaedf1",
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "0 12px",
      }}
    >
      <Tooltip title="Back">
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={onBack} aria-label="Back" />
      </Tooltip>

      {editing ? (
        <Input
          autoFocus
          size="small"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => {
            onNameChange(draft.trim() || name);
            setEditing(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            if (e.key === "Escape") {
              setDraft(name);
              setEditing(false);
            }
          }}
          style={{ maxWidth: 280 }}
        />
      ) : (
        <button
          onClick={() => {
            setDraft(name);
            setEditing(true);
          }}
          style={{
            background: "transparent",
            border: "none",
            padding: "4px 6px",
            margin: 0,
            fontSize: 14,
            fontWeight: 600,
            color: "#1f2937",
            cursor: "text",
            maxWidth: "40vw",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title="Click to rename"
        >
          {name}
        </button>
      )}

      <div style={{ flex: 1 }} />

      <Space size={4}>
        <Tooltip title="Undo">
          <Button
            type="text"
            icon={<UndoOutlined />}
            disabled={!canUndo}
            onClick={onUndo}
            aria-label="Undo"
          />
        </Tooltip>
        <Tooltip title="Redo">
          <Button
            type="text"
            icon={<RedoOutlined />}
            disabled={!canRedo}
            onClick={onRedo}
            aria-label="Redo"
          />
        </Tooltip>
        <Text type="secondary" style={{ fontSize: 12, minWidth: 40, textAlign: "right" }}>
          {zoomPct}%
        </Text>
        <Text type="secondary" style={{ fontSize: 12, minWidth: 76 }}>
          {statusLabel}
        </Text>
        {manualSave && (
          <Tooltip title="Save (Ctrl/Cmd+S)">
            <Button
              type={dirty ? "primary" : "default"}
              size="small"
              icon={<SaveOutlined />}
              onClick={onSave}
              disabled={!dirty && !saving}
            >
              Save
            </Button>
          </Tooltip>
        )}
        <Dropdown menu={menu} trigger={["click"]} placement="bottomRight">
          <Button type="text" icon={<EllipsisOutlined />} aria-label="Menu" />
        </Dropdown>
      </Space>
    </header>
  );
}
