import { useCallback, useEffect, useState } from "react";
import { getGallery, type GalleryItem } from "../lib/storage";

export interface GalleryEntry extends GalleryItem {
  url: string;
}

/** Past strips from IndexedDB as object URLs (revoked on change/unmount). */
export function useGallery() {
  const [items, setItems] = useState<GalleryEntry[] | null>(null);

  const reload = useCallback(async () => {
    try {
      const raw = await getGallery();
      setItems(raw.map((i) => ({ ...i, url: URL.createObjectURL(i.strip) })));
    } catch (e) {
      console.error("Failed to load gallery", e);
      setItems([]);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => () => items?.forEach((i) => URL.revokeObjectURL(i.url)), [items]);

  return { items, reload };
}
