import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Modal, Button, Typography, Space, Tag, Tooltip } from "antd";
import { LeftOutlined, PlusOutlined, RightOutlined } from "@ant-design/icons";
import { CanvasItem } from "@/components/editor/CanvasItem";
import type { TemplateDef } from "@/lib/templates";
import type { LayoutItem } from "@/lib/types";

const { Text, Title } = Typography;

interface Props {
  /** Full list of templates in the order they appear on the home page. */
  templates: TemplateDef[];
  /** Currently previewed template (null = closed). */
  template: TemplateDef | null;
  onChange: (next: TemplateDef | null) => void;
  onUse: (t: TemplateDef) => void;
}

function bounds(items: LayoutItem[]) {
  if (items.length === 0) return { x: 0, y: 0, w: 0, h: 0 };
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const it of items) {
    minX = Math.min(minX, it.x);
    minY = Math.min(minY, it.y);
    maxX = Math.max(maxX, it.x + it.width);
    maxY = Math.max(maxY, it.y + it.height);
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

export function TemplatePreview({ templates, template, onChange, onUse }: Props) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewportSize, setViewportSize] = useState({ w: 760, h: 500 });

  const currentIndex = template ? templates.findIndex((t) => t.id === template.id) : -1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < templates.length - 1;

  const goPrev = useCallback(() => {
    if (hasPrev) onChange(templates[currentIndex - 1]);
  }, [hasPrev, currentIndex, templates, onChange]);

  const goNext = useCallback(() => {
    if (hasNext) onChange(templates[currentIndex + 1]);
  }, [hasNext, currentIndex, templates, onChange]);

  // Measure viewport for fit-scaling
  useEffect(() => {
    if (!template || !viewportRef.current) return;
    const el = viewportRef.current;
    const ro = new ResizeObserver(() => {
      setViewportSize({ w: el.clientWidth, h: el.clientHeight });
    });
    ro.observe(el);
    setViewportSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, [template]);

  // Left/right arrows navigate, Enter uses the current template
  useEffect(() => {
    if (!template) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "Enter") {
        e.preventDefault();
        onUse(template);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [template, goNext, goPrev, onUse]);

  const built = useMemo(() => {
    if (!template) return null;
    const items = template.build();
    const b = bounds(items);
    const pad = 40;
    const scaleX = (viewportSize.w - pad * 2) / (b.w || 1);
    const scaleY = (viewportSize.h - pad * 2) / (b.h || 1);
    const scale = Math.min(scaleX, scaleY, 1);
    const offsetX = pad - b.x * scale + (viewportSize.w - pad * 2 - b.w * scale) / 2;
    const offsetY = pad - b.y * scale + (viewportSize.h - pad * 2 - b.h * scale) / 2;
    return { items, scale, offsetX, offsetY };
  }, [template, viewportSize]);

  const open = !!template;

  return (
    <Modal
      open={open}
      onCancel={() => onChange(null)}
      width={860}
      title={
        template ? (
          <Space size={10} align="baseline">
            <Title level={5} style={{ margin: 0 }}>
              {template.name}
            </Title>
            <Tag style={{ margin: 0 }}>{template.group}</Tag>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {currentIndex + 1} / {templates.length}
            </Text>
          </Space>
        ) : null
      }
      footer={
        template ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Tooltip title="Previous (←)">
              <Button icon={<LeftOutlined />} onClick={goPrev} disabled={!hasPrev} />
            </Tooltip>
            <Tooltip title="Next (→)">
              <Button icon={<RightOutlined />} onClick={goNext} disabled={!hasNext} />
            </Tooltip>
            <div style={{ flex: 1 }} />
            <Button onClick={() => onChange(null)}>Cancel</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => onUse(template)}>
              Use this template
            </Button>
          </div>
        ) : null
      }
      destroyOnClose={false}
    >
      <div style={{ marginBottom: 8 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {built ? `${built.items.length} objects` : ""}
        </Text>
      </div>
      <div
        ref={viewportRef}
        style={{
          position: "relative",
          width: "100%",
          height: 500,
          background: "#f7f6f1",
          border: "1px solid #eaedf1",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        {built && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              transform: `translate(${built.offsetX}px, ${built.offsetY}px) scale(${built.scale})`,
              transformOrigin: "0 0",
            }}
          >
            {built.items.map((it) => (
              <CanvasItem key={it.id} item={it} preview />
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
