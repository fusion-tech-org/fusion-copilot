import type { NodeType } from 'jsonc-parser';
import { Graph } from '../json/jsonParser';
import { calcNodeSize } from '../graph/calcNodeSize';

type Props = {
  graph: Graph;
  text: string | [string, string][];
  isEmpty?: boolean;
  type?: NodeType;
};

export const addNodeToGraph = ({
  graph, text, type = "null", isEmpty = false
}: Props) => {
  const id = String(graph.nodes.length + 1);
  const isParent = type === "array" || type === "object";
  const { width, height } = calcNodeSize(text, isParent);

  const node = {
    id,
    text,
    width,
    height,
    data: {
      type,
      isParent,
      isEmpty,
      childrenCount: isParent ? 1 : 0,
    },
  };

  graph.nodes.push(node);

  return id;
};