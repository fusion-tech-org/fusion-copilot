import { ViewPort } from 'react-zoomable-ui';
import type { CanvasRef, CanvasDirection } from 'reaflow';

import { EdgeData, NodeData } from 'pages/Developer/PageDataJson/interface';

export interface InternalStates {
  loading: boolean;
  nodes: NodeData[];
  edges: EdgeData[];
  collapsedNodes: string[];
  collapsedEdges: string[];
  collapsedParents: string[];
  selectedNode: NodeData | null;
}

export interface InternalActions {
  setLoading: (loading: boolean) => void;
  setGraph: (json: string) => void;
  refresh: () => void;
  setSelectedNode: (nodeData: NodeData) => void;
  expandNodes: (nodeId: string) => void;
  expandGraph: () => void;
  collapseNodes: (nodeId: string) => void;
  collapseGraph: () => void;
  getCollapsedNodeIds: () => string[];
  getCollapsedEdgeIds: () => string[];
}

export type ExternalStore = ExternalStates & ExternalActions;

export type ThemeMode = "dark" | "light";

export interface ExternalStates {
  json: string;
  canvas: CanvasRef | null;
  theme: ThemeMode;
  direction: CanvasDirection;
  collapseNodes: boolean;
  compactNodes: boolean;
  hideCollapseButton: boolean;
  hideChildrenCount: boolean;
  disableImagePreview: boolean;
  viewPort: ViewPort | null;
}

export interface ExternalActions {
  setViewPort: (ref: ViewPort) => void;
  setCanvas: (ref: CanvasRef) => void;
  setConfig: (config: Partial<ExternalStates>) => void;
  setDirection: (direction: CanvasDirection) => void;
  setJson: (json: string) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  centerView: () => void;
  getJson: () => string;
  getCanvas: () => CanvasRef | null;
  focusFirstNode: () => void;
}

export interface InternalStates {
  loading: boolean;
  nodes: NodeData[];
  edges: EdgeData[];
  collapsedNodes: string[];
  collapsedEdges: string[];
  collapsedParents: string[];
  selectedNode: NodeData | null;
}

export interface InternalActions {
  setLoading: (loading: boolean) => void;
  setGraph: (json: string) => void;
  refresh: () => void;
  setSelectedNode: (nodeData: NodeData) => void;
  expandNodes: (nodeId: string) => void;
  expandGraph: () => void;
  collapseNodes: (nodeId: string) => void;
  collapseGraph: () => void;
  getCollapsedNodeIds: () => string[];
  getCollapsedEdgeIds: () => string[];
}

