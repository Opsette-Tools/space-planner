import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import {
  App as AntApp,
  Button,
  Card,
  Collapse,
  Dropdown,
  Empty,
  Layout,
  List,
  Modal,
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
  FileImageOutlined,
  FileOutlined,
  FolderOpenOutlined,
  PlusOutlined,
  UnorderedListOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { deleteLayout, genId, listLayouts, saveLayout } from "@/lib/storage";
import { downloadJSON, importJSON } from "@/lib/exporters";
import { fileToReference, REFERENCE_ACCEPT } from "@/lib/referenceImport";
import {
  TEMPLATES,
  buildLayoutFromTemplate,
  newEmptyLayout,
  type TemplateDef,
} from "@/lib/templates";
import { LAYOUT_TYPE_LABEL, type Layout as LayoutData, type LayoutType } from "@/lib/types";
import { TemplatePreview } from "@/components/TemplatePreview";
import { Logo } from "@/components/Logo";

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph, Link } = Typography;

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
  const [aboutOpen, setAboutOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);

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

  const createUntitled = (type: LayoutType = "floor") => {
    const layout = newEmptyLayout("Untitled layout", type);
    navigate(`/editor/${layout.id}`, { state: { draft: layout } });
  };

  const handleUseTemplate = (t: TemplateDef) => {
    const layout = buildLayoutFromTemplate(t);
    navigate(`/editor/${layout.id}`, { state: { draft: layout } });
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

  const handleImportImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const layout = newEmptyLayout(file.name.replace(/\.[^.]+$/, "") || "From image", "general");
      const ref = await fileToReference(file, layout.canvas);
      layout.reference = ref;
      navigate(`/editor/${layout.id}`, { state: { draft: layout } });
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Couldn't read that file");
    }
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
    items: [
      ...TYPE_OPTIONS.map((t) => ({
        key: t,
        label: `New ${LAYOUT_TYPE_LABEL[t].toLowerCase()}`,
        onClick: () => createUntitled(t),
      })),
      { type: "divider" as const },
      {
        key: "from-image",
        icon: <FileImageOutlined />,
        label: "Start from image…",
        onClick: () => imageRef.current?.click(),
      },
      {
        key: "import",
        icon: <UploadOutlined />,
        label: "Import JSON",
        onClick: () => fileRef.current?.click(),
      },
    ],
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
    <Layout style={{ minHeight: "100vh", background: "#f7f8fa" }}>
      <Header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          height: 72,
          padding: "0 24px",
          background: "#ffffff",
          borderBottom: "1px solid #eaedf1",
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div />
        <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center" }}>
          <Logo size={40} color="#243958" />
          <Title
            level={3}
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 600,
              lineHeight: 1.1,
              whiteSpace: "nowrap",
            }}
          >
            Space Planner
          </Title>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            style={{ display: "none" }}
            onChange={handleImport}
          />
          <input
            ref={imageRef}
            type="file"
            accept={REFERENCE_ACCEPT}
            style={{ display: "none" }}
            onChange={handleImportImage}
          />
          <Dropdown.Button
            type="primary"
            menu={newMenu}
            onClick={() => createUntitled("floor")}
          >
            <PlusOutlined /> New
          </Dropdown.Button>
        </div>
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
                  style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.06)" }}
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
            <Card
              styles={{ body: { padding: 0 } }}
              style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.06)" }}
            >
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
          <Collapse
            defaultActiveKey={["Event", "Landscape", "Interior"]}
            bordered={false}
            style={{ background: "transparent" }}
            items={(["Event", "Landscape", "Interior"] as const).map((g) => ({
              key: g,
              label: (
                <Space size={8} align="baseline">
                  <Text strong style={{ fontSize: 13 }}>
                    {g}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {grouped[g].length}
                  </Text>
                </Space>
              ),
              style: {
                background: "#ffffff",
                marginBottom: 8,
                border: "1px solid #eaedf1",
                borderRadius: 8,
                boxShadow: "0 1px 3px rgba(15,23,42,0.04)",
              },
              children: (
                <div
                  style={{
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
                      style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.06)" }}
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
              ),
            }))}
          />
        </section>

      </Content>

      <Footer
        style={{
          textAlign: "center",
          background: "transparent",
          padding: "16px 24px 24px",
          fontSize: 12,
        }}
      >
        <Space size={8} wrap style={{ justifyContent: "center" }}>
          <Link onClick={() => setAboutOpen(true)} style={{ fontSize: 12 }}>
            About
          </Link>
          <Text type="secondary">·</Text>
          <Link onClick={() => setPrivacyOpen(true)} style={{ fontSize: 12 }}>
            Privacy
          </Link>
          <Text type="secondary">·</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            By{" "}
            <Link
              href="https://opsette.io"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 12 }}
            >
              Opsette
            </Link>
          </Text>
        </Space>
      </Footer>

      <TemplatePreview
        templates={TEMPLATES}
        template={previewTemplate}
        onChange={setPreviewTemplate}
        onUse={(t) => {
          setPreviewTemplate(null);
          handleUseTemplate(t);
        }}
      />

      <Modal
        title="About Space Planner"
        open={aboutOpen}
        onCancel={() => setAboutOpen(false)}
        footer={null}
        width={520}
      >
        <Paragraph type="secondary" style={{ marginBottom: 12 }}>
          A business tool from Opsette Marketplace.
        </Paragraph>
        <Paragraph>
          Space Planner helps you sketch floor plans, event layouts, garden beds, and seating
          charts. Drag furniture and event objects onto a canvas, group related items, and
          start from a template when you don't want to begin from scratch.
        </Paragraph>
        <Title level={5} style={{ marginTop: 16 }}>
          How it works
        </Title>
        <Paragraph>
          <ol style={{ paddingLeft: 20, margin: 0 }}>
            <li>Start a blank layout or pick a template (event, landscape, or interior).</li>
            <li>Drag objects from the left library onto the canvas.</li>
            <li>Click an object to edit its size, color, rotation, and notes on the right.</li>
            <li>Group related items so they move together; ungroup when you need to edit one.</li>
            <li>Save when you're happy — export as PNG or JSON to share.</li>
          </ol>
        </Paragraph>
        <Paragraph type="secondary" italic style={{ fontSize: 12, marginTop: 16 }}>
          Everything runs in your browser. Your layouts are saved locally on this device —
          nothing is sent to any server.
        </Paragraph>
        <Paragraph style={{ fontSize: 12, marginTop: 8 }}>
          Find more tools at{" "}
          <Link href="https://opsette.io" target="_blank" rel="noopener noreferrer">
            opsette.io
          </Link>
          .
        </Paragraph>
      </Modal>

      <Modal
        title="Privacy Policy"
        open={privacyOpen}
        onCancel={() => setPrivacyOpen(false)}
        footer={null}
        width={520}
      >
        <Paragraph strong>Space Planner respects your privacy.</Paragraph>

        <Title level={5}>No data collection</Title>
        <Paragraph>
          Space Planner runs entirely in your browser. We do not collect, store, or transmit
          any personal information. All interactions happen locally on your device.
        </Paragraph>

        <Title level={5}>No cookies or tracking</Title>
        <Paragraph>
          We do not use cookies, analytics, or any third-party tracking services.
        </Paragraph>

        <Title level={5}>No account required</Title>
        <Paragraph>
          There is no sign-up, no login, and no data stored on any server. Your layouts are
          saved locally in your browser (IndexedDB) and are never shared with anyone.
        </Paragraph>

        <Title level={5}>Contact</Title>
        <Paragraph>
          If you have questions about this policy, reach us through{" "}
          <Link href="https://opsette.io" target="_blank" rel="noopener noreferrer">
            opsette.io
          </Link>
          .
        </Paragraph>

        <Paragraph type="secondary" style={{ fontSize: 12, marginTop: 16 }}>
          Last updated: April 2026
        </Paragraph>
      </Modal>
    </Layout>
  );
}
