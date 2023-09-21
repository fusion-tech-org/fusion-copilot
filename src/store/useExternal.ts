import { create } from 'zustand';
import { ExternalStates, ExternalStore } from './interface';
import { useInternal } from "./useInternal";


const initStates: ExternalStates = {
  json: "",
  canvas: null,
  theme: "dark",
  direction: "RIGHT",
  collapseNodes: false,
  compactNodes: false,
  disableImagePreview: false,
  hideChildrenCount: false,
  hideCollapseButton: false,
  viewPort: null,
}


export const useExternal = create<ExternalStore>()((set, get) => ({
  ...initStates,
  getCanvas: () => get().canvas,
  setCanvas: canvas => set({ canvas }),
  setViewPort: viewPort => set({ viewPort }),
  setConfig: config => {
    set({ ...get(), ...config });

    if (config.collapseNodes === true) useInternal.getState().collapseGraph();
    if (!config.collapseNodes === false) useInternal.getState().expandGraph();
    if (typeof config.compactNodes === "boolean") {
      useInternal.getState().refresh();
    }
  },
  setJson: json => {
    set({ json });
    useInternal.getState().setGraph(json);
  },
  getJson: () => get().json,
  zoomIn: () => {
    const viewPort = get().viewPort;
    viewPort?.camera?.recenter(viewPort.centerX, viewPort.centerY, viewPort.zoomFactor + 0.1);
  },
  zoomOut: () => {
    const viewPort = get().viewPort;
    viewPort?.camera?.recenter(viewPort.centerX, viewPort.centerY, viewPort.zoomFactor - 0.1);
  },
  centerView: () => {
    const viewPort = get().viewPort;
    const container = get().getCanvas()?.containerRef.current;
    if (container) viewPort?.camera?.centerFitElementIntoView(container);
  },
  focusFirstNode: () => {
    const rootNode = document.querySelector("g[id*='node-1']");
    get().viewPort?.camera?.centerFitElementIntoView(rootNode as HTMLElement, {
      elementExtraMarginForZoom: 100,
    });
  },
  setDirection: direction => set({ direction }),
}))