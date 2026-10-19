// Camera choice (front/back) and the back camera's torch, shared by the
// set-up snapshot and the real shoot.

export type Facing = "user" | "environment";

const FACING_KEY = "photobooth_camera";
const FLASH_KEY = "photobooth_flash";

export const getFacing = (): Facing => (localStorage.getItem(FACING_KEY) === "environment" ? "environment" : "user");
export const setFacing = (f: Facing) => localStorage.setItem(FACING_KEY, f);

/** Flash is off by default so nothing changes unless you ask for it. */
export const isFlashOn = () => localStorage.getItem(FLASH_KEY) === "on";
export const setFlashOn = (on: boolean) => localStorage.setItem(FLASH_KEY, on ? "on" : "off");

/** Full resolution from the chosen camera; the strip crops to 3:4 itself. */
export function openCamera(facing: Facing) {
  return navigator.mediaDevices.getUserMedia({
    video: { width: { ideal: 1920 }, height: { ideal: 1440 }, facingMode: { ideal: facing } },
  });
}

/** More than one camera? Labels/ids are only complete after permission, so call once streaming. */
export async function hasSeveralCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((d) => d.kind === "videoinput").length > 1;
  } catch {
    return false;
  }
}

/** Front cameras are previewed mirrored (like a mirror); back cameras as-is. */
export const isMirrored = (stream: MediaStream | null) => {
  const s = stream?.getVideoTracks()[0]?.getSettings();
  return s?.facingMode ? s.facingMode !== "environment" : true;
};

type TorchCaps = MediaTrackCapabilities & { torch?: boolean };

export function canTorch(stream: MediaStream | null) {
  const track = stream?.getVideoTracks()[0];
  try {
    return Boolean((track?.getCapabilities?.() as TorchCaps | undefined)?.torch);
  } catch {
    return false;
  }
}

export async function setTorch(stream: MediaStream | null, on: boolean) {
  const track = stream?.getVideoTracks()[0];
  if (!track) return;
  try {
    await track.applyConstraints({ advanced: [{ torch: on } as MediaTrackConstraintSet] });
  } catch (e) {
    console.warn("Torch unavailable", e);
  }
}
