const PHONE_OUTER_MARGIN = 12;
const PHONE_CONTENT_INSET = 24;
const PHONE_MAX_WIDTH = 860;
const PHONE_MAX_HEIGHT = 690;

export interface PhonePanelLayout {
  panelWidth: number;
  panelHeight: number;
  x: number;
  y: number;
  bodyX: number;
  bodyWidth: number;
}

export function getPhonePanelLayout(viewportWidth: number, viewportHeight: number): PhonePanelLayout {
  const panelWidth = Math.max(280, Math.min(PHONE_MAX_WIDTH, viewportWidth - PHONE_OUTER_MARGIN * 2));
  const panelHeight = Math.max(360, Math.min(PHONE_MAX_HEIGHT, viewportHeight - PHONE_OUTER_MARGIN * 2));
  const x = Math.max(PHONE_OUTER_MARGIN, Math.round((viewportWidth - panelWidth) / 2));
  const y = Math.max(PHONE_OUTER_MARGIN, Math.round((viewportHeight - panelHeight) / 2));
  return {
    panelWidth,
    panelHeight,
    x,
    y,
    bodyX: x + PHONE_CONTENT_INSET,
    bodyWidth: panelWidth - PHONE_CONTENT_INSET * 2
  };
}

export function getPhoneCameraScale(cameraZoom: number): number {
  return 1 / Math.max(0.001, cameraZoom);
}

export const PHONE_CONTENT_INSET_PX = PHONE_CONTENT_INSET;
