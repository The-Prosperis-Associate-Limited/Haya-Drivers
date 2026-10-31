const STORAGE_KEY = "haya_referral_code";

export const stashReferralCode = function (code: string) {
  try {
    window.localStorage.setItem(STORAGE_KEY, code);
  } catch {}
};

export const readStashedReferralCode = function () {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
};

export const clearStashedReferralCode = function () {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {}
};
