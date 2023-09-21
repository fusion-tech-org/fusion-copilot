import { ComponentPropsWithoutRef } from "react";
import type { ElkRoot } from 'reaflow';

import { ExternalStates } from "store/interface";

export declare type NodeType =
  | "object"
  | "array"
  | "property"
  | "string"
  | "number"
  | "boolean"
  | "null";

export interface NodeData {
  id: string;
  text: string | [string, string][];
  width: number;
  height: number;
  path?: string;
  data: {
    type: NodeType;
    isParent: boolean;
    isEmpty: boolean;
    childrenCount: number;
  };
}

export interface EdgeData {
  id: string;
  from: string;
  to: string;
}

export enum FileFormat {
  "JSON" = "json",
  "YAML" = "yaml",
  "XML" = "xml",
  "TOML" = "toml",
  "CSV" = "csv",
}

export interface GraphProps extends ComponentPropsWithoutRef<'div'> {
  json: string;
  layout?: Omit<Partial<ExternalStates>, "json" | "viewPort">;
  onNodeClick?: (data: NodeData) => void;
  onLayoutChange?: (layout: ElkRoot) => void;
}

export interface CustomNodeProps {
  node: NodeData;
  x: number;
  y: number;
  hasCollapse?: boolean;
}