const STORAGE_KEY = "haya_device_id";

export const getDeviceId = function () {
  if (typeof window === "undefined") return undefined;

  try {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;

    const id = window.crypto.randomUUID();
    window.localStorage.setItem(STORAGE_KEY, id);
    return id;
  } catch {
    return undefined;
  }
};
