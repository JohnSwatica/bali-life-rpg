export function shouldUseTouchControls(deviceReportsTouch: boolean, isDev: boolean, search = ""): boolean {
  if (deviceReportsTouch) {
    return true;
  }
  if (!isDev) {
    return false;
  }
  return new URLSearchParams(search).get("touch") === "1";
}
