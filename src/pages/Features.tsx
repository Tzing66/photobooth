import { useState } from "react";
import InfoPage from "../components/InfoPage";
import Modal from "../components/Modal";
import Spinner from "../components/Spinner";
import { useGallery, type GalleryEntry } from "../hooks/useGallery";
import { frameDef, type FrameType } from "../lib/frames";
import { saveImage } from "../lib/output";
import { clearGallery, deleteFromGallery } from "../lib/storage";

const TILTS = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2", "rotate-0"];
const fmt = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });

/** Every strip you've printed, kept only in this browser. */
export default function Features() {
  const { items, reload } = useGallery();
  const [open, setOpen] = useState<GalleryEntry | null>(null);

  const remove = async (id: string) => {
    await deleteFromGallery(id);
    setOpen(null);
    reload();
  };

  const wipe = async () => {
    if (!confirm("Delete every strip in your gallery? This can't be undone.")) return;
    await clearGallery();
    reload();
  };

  return (
    <InfoPage title="Your Strips" wide>
      {!items ? (
        <div className="grid place-items-center py-20">
          <Spinner />
        </div>
      ) : items.length === 0 ? (
        <p className="text-center opacity-80">No strips yet. Step into the booth and make your first one!</p>
      ) : (
        <>
          <p className="mb-8 text-center text-sm opacity-80">
            {items.length} strip{items.length === 1 ? "" : "s"} · saved only in this browser
          </p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-10">
            {items.map((item, i) => (
              <button key={item.id} onClick={() => setOpen(item)} className={`transition-transform hover:scale-105 ${TILTS[i % TILTS.length]}`}>
                <img
                  src={item.url}
                  alt={`Strip from ${fmt.format(item.createdAt)}`}
                  className="h-[min(38dvh,20rem)] w-auto shadow-lg shadow-black/30"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
          <div className="mt-12 text-center">
            <button className="btn" onClick={wipe}>
              clear gallery
            </button>
          </div>
        </>
      )}

      <Modal open={!!open} onClose={() => setOpen(null)} className="max-w-md">
        {open && (
          <div className="flex flex-col items-center gap-3 p-5 pt-10">
            <img src={open.url} alt="Strip" className="max-h-[60dvh] w-auto object-contain shadow-lg shadow-black/30" />
            <p className="text-sm opacity-80">
              {frameDef(open.frame as FrameType).name} · {fmt.format(open.createdAt)}
            </p>
            <div className="flex gap-2">
              <button className="btn" onClick={() => saveImage(open.url, `photostrip-${open.createdAt}.png`, new File([open.strip], `photostrip-${open.createdAt}.png`, { type: open.strip.type || "image/png" }))}>
                download
              </button>
              <button className="btn" onClick={() => remove(open.id)}>
                delete
              </button>
            </div>
          </div>
        )}
      </Modal>
    </InfoPage>
  );
}
