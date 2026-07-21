// [Honest technical note] A plain web app/WebView cannot read a true
// hardware device ID (no native API access without a Capacitor plugin).
// The standard, honest web approach is a persistent random ID stored in
// localStorage, combined with coarse browser signals — good enough to catch
// casual duplicate-account attempts, but a determined user clearing
// localStorage can still get a "new" device ID. Document this limitation
// rather than pretending it's unbeatable.
const STORAGE_KEY = "vortexia-device-id";

export function getDeviceId(): string {
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}
