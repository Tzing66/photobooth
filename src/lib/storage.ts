// IndexedDB persistence. Photos are large data URLs, which overflow localStorage
// quickly, so everything image-shaped lives here.
//
//   session store: photo_0..3 (raw captures), photostrip, individual_0..3
//   gallery store: every finished strip, newest first (powers the featured board)

const DB_NAME = "photobooth";
const DB_VERSION = 1;
const SESSION = "session";
const GALLERY = "gallery";

export type Photos = (string | null)[];

export interface GalleryItem {
  id: string;
  strip: Blob;
  frame: string;
  createdAt: number;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function db(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const d = req.result;
        if (!d.objectStoreNames.contains(SESSION)) d.createObjectStore(SESSION);
        if (!d.objectStoreNames.contains(GALLERY)) {
          d.createObjectStore(GALLERY, { keyPath: "id" }).createIndex("createdAt", "createdAt");
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => {
        dbPromise = null;
        reject(req.error);
      };
    });
  }
  return dbPromise;
}

function run<T>(store: string, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return db().then(
    (d) =>
      new Promise<T>((resolve, reject) => {
        const req = fn(d.transaction(store, mode).objectStore(store));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(normaliseError(req.error));
      }),
  );
}

export class StorageFullError extends Error {
  constructor() {
    super("STORAGE_QUOTA_EXCEEDED");
  }
}

function normaliseError(err: DOMException | null) {
  return err?.name === "QuotaExceededError" ? new StorageFullError() : err;
}

const get = <T>(key: string) => run<T | undefined>(SESSION, "readonly", (s) => s.get(key));
const put = (key: string, value: unknown) => run(SESSION, "readwrite", (s) => s.put(value, key));
const del = (key: string) => run(SESSION, "readwrite", (s) => s.delete(key));

// --- session photos -------------------------------------------------------

export const savePhoto = (index: number, dataUrl: string) => put(`photo_${index}`, dataUrl);

export async function getAllPhotos(): Promise<Photos> {
  return Promise.all([0, 1, 2, 3].map(async (i) => (await get<string>(`photo_${i}`)) ?? null));
}

export const clearAllPhotos = () => Promise.all([0, 1, 2, 3].map((i) => del(`photo_${i}`))).then(() => {});

export const savePhotostrip = (dataUrl: string) => put("photostrip", dataUrl);
export const getPhotostrip = async () => (await get<string>("photostrip")) ?? null;
export const clearPhotostrip = () => del("photostrip");

export const saveIndividualPhotos = (urls: string[]) =>
  Promise.all(urls.map((u, i) => put(`individual_${i}`, u))).then(() => {});

export async function getIndividualPhotos(): Promise<string[]> {
  const all = await Promise.all([0, 1, 2, 3].map((i) => get<string>(`individual_${i}`)));
  return all.filter((x): x is string => !!x);
}

export const clearIndividualPhotos = () =>
  Promise.all([0, 1, 2, 3].map((i) => del(`individual_${i}`))).then(() => {});

export async function clearSession() {
  await Promise.all([clearAllPhotos(), clearPhotostrip(), clearIndividualPhotos()]);
}

export const isComplete = (photos: Photos) => photos.length === 4 && photos.every((p) => !!p);

// --- gallery --------------------------------------------------------------

export async function addToGallery(stripDataUrl: string, frame: string) {
  const strip = await (await fetch(stripDataUrl)).blob();
  const item: GalleryItem = { id: crypto.randomUUID(), strip, frame, createdAt: Date.now() };
  await run(GALLERY, "readwrite", (s) => s.put(item));
  return item;
}

export async function getGallery(): Promise<GalleryItem[]> {
  const items = await run<GalleryItem[]>(GALLERY, "readonly", (s) => s.getAll());
  return items.sort((a, b) => b.createdAt - a.createdAt);
}

export const deleteFromGallery = (id: string) => run(GALLERY, "readwrite", (s) => s.delete(id));
export const clearGallery = () => run(GALLERY, "readwrite", (s) => s.clear());
