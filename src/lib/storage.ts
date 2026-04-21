import { get, set, del, keys } from "idb-keyval";
import type { Layout } from "./types";

const PREFIX = "layout:";

function key(id: string) {
  return `${PREFIX}${id}`;
}

export async function listLayouts(): Promise<Layout[]> {
  const allKeys = await keys();
  const layoutKeys = allKeys.filter(
    (k) => typeof k === "string" && k.startsWith(PREFIX),
  ) as string[];
  const layouts = await Promise.all(layoutKeys.map((k) => get<Layout>(k)));
  return layouts
    .filter((l): l is Layout => !!l)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getLayout(id: string): Promise<Layout | undefined> {
  return get<Layout>(key(id));
}

export async function saveLayout(layout: Layout): Promise<void> {
  await set(key(layout.id), layout);
}

export async function deleteLayout(id: string): Promise<void> {
  await del(key(id));
}

export function genId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}