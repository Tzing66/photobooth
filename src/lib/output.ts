// Getting a strip off the screen: download, native share sheet, and print.

export function download(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

/** 1080×1920 story-sized card: the strip centred on grey. */
export async function storyImage(stripUrl: string): Promise<{ dataUrl: string; blob: Blob }> {
  const img = await loadImage(stripUrl);
  const c = document.createElement("canvas");
  c.width = 1080;
  c.height = 1920;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#E0E0E0";
  ctx.fillRect(0, 0, c.width, c.height);
  const k = Math.min((c.width * 0.8) / img.width, (c.height * 0.7) / img.height);
  const w = img.width * k;
  const h = img.height * k;
  ctx.drawImage(img, (c.width - w) / 2, (c.height - h) / 2, w, h);
  const blob = await new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("toBlob failed"))), "image/png"));
  return { dataUrl: c.toDataURL("image/png"), blob };
}

export function canShareFiles(file: File) {
  return typeof navigator.share === "function" && navigator.canShare?.({ files: [file] });
}

/** Opens a print-ready page sized for A4 with the strip centred at half page height. */
export function printStrip(stripUrl: string) {
  const w = window.open("", "_blank");
  if (!w) {
    const a = document.createElement("a");
    a.href = stripUrl;
    a.target = "_blank";
    a.click();
    return;
  }
  w.document.write(`<!DOCTYPE html>
<html><head><title>Print Photostrip</title>
<style>
  body { margin:0; display:flex; justify-content:center; align-items:center; min-height:100vh; background:white; }
  .strip { max-width:100%; max-height:100vh; object-fit:contain; }
  @media print {
    @page { margin:0; size:A4 portrait; }
    body { overflow:hidden; }
    .strip { height:50vh; width:auto; margin:25vh auto; page-break-inside:avoid; }
  }
</style></head>
<body><img class="strip" src="${stripUrl}" alt="Photostrip" />
<script>window.onload=function(){window.print();window.onafterprint=function(){window.close();};};<\/script>
</body></html>`);
  w.document.close();
}
