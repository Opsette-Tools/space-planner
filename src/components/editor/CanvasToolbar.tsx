import { Button, Tooltip, Divider } from "antd";
import {
  AppstoreOutlined,
  BorderOutlined,
  ColumnHeightOutlined,
  ExpandOutlined,
  MinusOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

interface Props {
  showGrid: boolean;
  snap: boolean;
  gridSize: number;
  onToggleGrid: () => void;
  onToggleSnap: () => void;
  onCycleGridSize: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onFit: () => void;
}

export function CanvasToolbar(p: Props) {
  const sizeLabel = p.gridSize <= 8 ? "S" : p.gridSize <= 16 ? "M" : "L";
  return (
    <div
      style={{
        position: "absolute",
        bottom: 14,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        alignItems: "center",
        gap: 2,
        padding: 4,
        background: "rgba(255,255,255,0.96)",
        backdropFilter: "blur(6px)",
        border: "1px solid #eaedf1",
        borderRadius: 999,
        boxShadow: "0 1px 8px rgba(15, 23, 42, 0.08)",
        zIndex: 10,
      }}
    >
      <Tooltip title="Zoom out">
        <Button type="text" shape="circle" size="small" icon={<MinusOutlined />} onClick={p.onZoomOut} />
      </Tooltip>
      <Tooltip title="Zoom in">
        <Button type="text" shape="circle" size="small" icon={<PlusOutlined />} onClick={p.onZoomIn} />
      </Tooltip>
      <Tooltip title="Reset view">
        <Button type="text" shape="circle" size="small" icon={<ReloadOutlined />} onClick={p.onReset} />
      </Tooltip>
      <Tooltip title="Fit to content">
        <Button type="text" shape="circle" size="small" icon={<ExpandOutlined />} onClick={p.onFit} />
      </Tooltip>
      <Divider type="vertical" style={{ margin: "0 4px", height: 18 }} />
      <Tooltip title={p.showGrid ? "Hide grid" : "Show grid"}>
        <Button
          type={p.showGrid ? "primary" : "text"}
          shape="circle"
          size="small"
          icon={<AppstoreOutlined />}
          onClick={p.onToggleGrid}
        />
      </Tooltip>
      <Tooltip title={p.snap ? "Disable snap" : "Enable snap"}>
        <Button
          type={p.snap ? "primary" : "text"}
          shape="circle"
          size="small"
          icon={<BorderOutlined />}
          onClick={p.onToggleSnap}
        />
      </Tooltip>
      <Tooltip title={`Grid size: ${sizeLabel} (click to cycle)`}>
        <Button
          type="text"
          size="small"
          icon={<ColumnHeightOutlined />}
          onClick={p.onCycleGridSize}
          style={{ borderRadius: 999, padding: "0 10px", fontSize: 11, fontWeight: 600 }}
        >
          {sizeLabel}
        </Button>
      </Tooltip>
    </div>
  );
}
