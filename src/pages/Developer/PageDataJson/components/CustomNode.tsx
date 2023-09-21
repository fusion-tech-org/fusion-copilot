import React, { lazy } from "react";
import { Node, NodeProps } from "reaflow";
import { NodeData } from "../interface";

const ObjectNode = lazy(() => import("./ObjectNode"));
const TextNode = lazy(() => import("./TextNode"));

export interface CustomNodeProps {
  node: NodeData;
  x: number;
  y: number;
  hasCollapse?: boolean;
}

const rootProps = {
  rx: 50,
  ry: 50,
};

export const CustomNode = (nodeProps: NodeProps) => {
  const { text, data } = nodeProps.properties;

  return (
    <Node {...nodeProps} {...(data.isEmpty && rootProps)} label={<React.Fragment />}>
      {({ node, x, y }) => {
        const isTextArray = Array.isArray(text);
        const commonProps = { node: node as NodeData, x, y };
        const hasCollapse = !!data.childrenCount;

        if (isTextArray) return <ObjectNode {...commonProps} />;
        return <TextNode {...commonProps} hasCollapse={hasCollapse} />;
      }}
    </Node>
  );
};