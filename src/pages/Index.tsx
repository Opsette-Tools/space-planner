import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import {
  App as AntApp,
  Button,
  Card,
  Dropdown,
  Empty,
  Layout,
  List,
  Segmented,
  Space,
  Tag,
  Typography,
} from "antd";
import type { MenuProps } from "antd";
import {
  AppstoreOutlined,
  CopyOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EllipsisOutlined,
  FileOutlined,
  FolderOpenOutlined,
  PlusOutlined,
  UnorderedListOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { deleteLayout, genId, listLayouts, saveLayout } from "@/lib/storage";
import { downloadJSON, importJSON } from "@/lib/exporters";
import {
  TEMPLATES,
  buildLayoutFromTemplate,
  newEmptyLayout,
  type TemplateDef,
} from "@/lib/templates";
import { LAYOUT_TYPE_LABEL, type Layout as LayoutData, type LayoutType } from "@/lib/types";
import { TemplatePreview } from "@/components/TemplatePreview";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const TYPE_OPTIONS: LayoutType[] = ["floor", "event", "garden", "seating", "general"];
const LIST_THRESHOLD = 6;

type ViewMode = "grid" | "list";

export default function Index() {
  const navigate = useNavigate();
  const { message, modal } = AntApp.useApp();
  const [layouts, setLayouts] = useState<LayoutData[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [viewModeUserSet, setViewModeUserSet] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<TemplateDef | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = async () => {
    const next = await listLayouts();
    setLayouts(next);
    setLoading(false);
    if (!viewModeUserSet) {
      setViewMode(next.length > LIST_THRESHOLD ? "list" : "grid");
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createUntitled = async (type: LayoutType = "floor") => {
    const layout = newEmptyLayout("Untitled layout", type);
    await saveLayout(layout);
    navigate(`/editor/${layout.id}`);
  };

  const handleUseTemplate = async (t: TemplateDef) => {
    const layout = buildLayoutFromTemplate(t);
    await saveLayout(layout);
    navigate(`/editor/${layout.id}`);
  };

  const handleDuplicate = async (l: LayoutData) => {
    const copy: LayoutData = {
      ...l,
      id: genId(),
      name: `${l.name} (copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await saveLayout(copy);
    message.success("Layout duplicated");
    refresh();
  };

  const handleDelete = (l: LayoutData) => {
    modal.confirm({
      title: "Delete layout?",
      content: `"${l.name}" will be permanently removed.`,
      okText: "Delete",
      okButtonProps: { danger: true },
      onOk: async () => {
        await deleteLayout(l.id);
        message.success("Layout deleted");
        refresh();
      },
    });
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const imported = await importJSON(file);
      const fresh: LayoutData = {
        ...imported,
        id: genId(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await saveLayout(fresh);
      navigate(`/editor/${fresh.id}`);
    } catch {
      message.error("Invalid layout file");
    }
  };

  const grouped = useMemo(() => {
    const g: Record<string, typeof TEMPLATES> = { Event: [], Landscape: [], Interior: [] };
    TEMPLATES.forEach((t) => g[t.group].push(t));
    return g;
  }, []);

  const newMenu: MenuProps = {
    items: TYPE_OPTIONS.map((t) => ({
      key: t,
      label: `New ${LAYOUT_TYPE_LABEL[t].toLowerCase()}`,
      onClick: () => createUntitled(t),
    })),
  };

  const itemMenu = (l: LayoutData): MenuProps => ({
    items: [
      {
        key: "open",
        icon: <FolderOpenOutlined />,
        label: "Open",
        onClick: ({ domEvent }) => {
          domEvent.stopPropagation();
          navigate(`/editor/${l.id}`);
        },
      },
      {
        key: "duplicate",
        icon: <CopyOutlined />,
        label: "Duplicate",
        onClick: ({ domEvent }) => {
          domEvent.stopPropagation();
          handleDuplicate(l);
        },
      },
      {
        key: "export",
        icon: <DownloadOutlined />,
        label: "Export JSON",
        onClick: ({ domEvent }) => {
          domEvent.stopPropagation();
          downloadJSON(l);
        },
      },
      { type: "divider" },
      {
        key: "delete",
        icon: <DeleteOutlined />,
        label: "Delete",
        danger: true,
        onClick: ({ domEvent }) => {
          domEvent.stopPropagation();
          handleDelete(l);
        },
      },
    ],
  });

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f6f8" }}>
      <Header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          height: 56,
          padding: "0 20px",
          background: "#ffffff",
          borderBottom: "1px solid #eaedf1",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            background: "#243958",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
          }}
        >
          <AppstoreOutlined />
        </div>
        <Title level={5} style={{ margin: 0, fontSize: 16, fontWeight: 600, lineHeight: 1 }}>
          Space Planner
        </Title>
        <div style={{ flex: 1 }} />
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          style={{ display: "none" }}
          onChange={handleImport}
        />
        <Button icon={<UploadOutlined />} onClick={() => fileRef.current?.click()}>
          Import
        </Button>
        <Dropdown.Button
          type="primary"
          menu={newMenu}
          onClick={() => createUntitled("floor")}
        >
          <PlusOutlined /> New
        </Dropdown.Button>
      </Header>

      <Content style={{ maxWidth: 1100, width: "100%", margin: "0 auto", padding: "24px 20px 48px" }}>
        <section style={{ marginBottom: 40 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <Space size={10} align="baseline">
              <Text
                strong
                style={{ fontSize: 11, letterSpacing: 0.6, textTransform: "uppercase", color: "#64748b" }}
              >
                Your layouts
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {layouts.length} saved
              </Text>
            </Space>
            {layouts.length > 0 && (
              <Segmented
                size="small"
                value={viewMode}
                onChange={(v) => {
                  setViewMode(v as ViewMode);
                  setViewModeUserSet(true);
                }}
                options={[
                  { value: "grid", icon: <AppstoreOutlined /> },
                  { value: "list", icon: <UnorderedListOutlined /> },
                ]}
              />
            )}
          </div>

          {loading ? (
            <Text type="secondary">Loading…</Text>
          ) : layouts.length === 0 ? (
            <Card style={{ borderStyle: "dashed" }} styles={{ body: { padding: 32, textAlign: "center" } }}>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No layouts yet. Start fresh, or pick a template below."
              >
                <Button type="primary" icon={<PlusOutlined />} onClick={() => createUntitled("floor")}>
                  New layout
                </Button>
              </Empty>
            </Card>
          ) : viewMode === "grid" ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: 14,
              }}
            >
              {layouts.map((l) => (
                <Card
                  key={l.id}
                  hoverable
                  onClick={() => navigate(`/editor/${l.id}`)}
                  styles={{ body: { padding: 10 } }}
                  cover={
                    <div
                      style={{
                        aspectRatio: "4 / 3",
                        background: "#f2efe8",
                        borderBottom: "1px solid #eaedf1",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {l.thumbnail ? (
                        <img
                          src={l.thumbnail}
                          alt={l.name}
                          style={{ width: "100%", height: "100%", objectFit: "contain" }}
                        />
                      ) : (
                        <FileOutlined style={{ fontSize: 28, color: "#c8cfd8" }} />
                      )}
                    </div>
                  }
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Text strong ellipsis style={{ display: "block", fontSize: 13 }}>
                        {l.name}
                      </Text>
                      <Space size={6} style={{ marginTop: 4 }}>
                        <Tag style={{ margin: 0, fontSize: 10, lineHeight: "16px", padding: "0 5px" }}>
                          {LAYOUT_TYPE_LABEL[l.type]}
                        </Tag>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {formatDistanceToNow(l.updatedAt, { addSuffix: true })}
                        </Text>
                      </Space>
                    </div>
                    <Dropdown menu={itemMenu(l)} trigger={["click"]} placement="bottomRight">
                      <Button
                        type="text"
                        size="small"
                        icon={<EllipsisOutlined />}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Dropdown>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card styles={{ body: { padding: 0 } }}>
              <List
                dataSource={layouts}
                renderItem={(l) => (
                  <List.Item
                    onClick={() => navigate(`/editor/${l.id}`)}
                    style={{ padding: "10px 14px", cursor: "pointer" }}
                    actions={[
                      <Dropdown key="menu" menu={itemMenu(l)} trigger={["click"]} placement="bottomRight">
                        <Button
                          type="text"
                          size="small"
                          icon={<EllipsisOutlined />}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </Dropdown>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 6,
                            overflow: "hidden",
                            background: "#f2efe8",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "1px solid #eaedf1",
                          }}
                        >
                          {l.thumbnail ? (
                            <img
                              src={l.thumbnail}
                              alt={l.name}
                              style={{ width: "100%", height: "100%", objectFit: "contain" }}
                            />
                          ) : (
                            <FileOutlined style={{ fontSize: 16, color: "#c8cfd8" }} />
                          )}
                        </div>
                      }
                      title={
                        <Text strong ellipsis style={{ fontSize: 13 }}>
                          {l.name}
                        </Text>
                      }
                      description={
                        <Space size={6}>
                          <Tag style={{ margin: 0, fontSize: 10, lineHeight: "16px", padding: "0 5px" }}>
                            {LAYOUT_TYPE_LABEL[l.type]}
                          </Tag>
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            Updated {formatDistanceToNow(l.updatedAt, { addSuffix: true })}
                          </Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          )}
        </section>

        <section>
          <Text
            strong
            style={{
              display: "block",
              fontSize: 11,
              letterSpacing: 0.6,
              textTransform: "uppercase",
              color: "#64748b",
              marginBottom: 12,
            }}
          >
            Start from a template
          </Text>
          {(["Event", "Landscape", "Interior"] as const).map((g) => (
            <div key={g} style={{ marginBottom: 18 }}>
              <Text type="secondary" style={{ fontSize: 12, fontWeight: 500 }}>
                {g}
              </Text>
              <div
                style={{
                  marginTop: 6,
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                  gap: 10,
                }}
              >
                {grouped[g].map((t) => (
                  <Card
                    key={t.id}
                    hoverable
                    onClick={() => setPreviewTemplate(t)}
                    styles={{ body: { padding: "10px 12px" } }}
                  >
                    <Text strong style={{ display: "block", fontSize: 13 }}>
                      {t.name}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {LAYOUT_TYPE_LABEL[t.type]}
                    </Text>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </section>

        <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 12, paddingTop: 16 }}>
          Layouts are saved locally on this device.
        </div>
      </Content>

      <TemplatePreview
        templates={TEMPLATES}
        template={previewTemplate}
        onChange={setPreviewTemplate}
        onUse={(t) => {
          setPreviewTemplate(null);
          handleUseTemplate(t);
        }}
      />
    </Layout>
  );
}
