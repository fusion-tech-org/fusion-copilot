import React from "react";
import { CustomNodeProps } from "../interface";
import { TextRenderer } from "./TextRenderer";
import * as Styled from "./styles";

type Row = [string, string];

type RowProps = {
  row: Row;
  x: number;
  y: number;
  index: number;
};

const Row = ({ row, x, y, index }: RowProps) => {
  const [rowKey, rowValue] = row;
  const objKey = JSON.stringify(rowKey).replace(/"/g, "");
  const objValue = JSON.stringify(rowValue);
  const objType = JSON.stringify(rowValue);
  const dataKey = JSON.stringify(row);

  return (
    <Styled.StyledRow data-x={x} data-y={y + index * 17.8} data-key={dataKey} $type={objType}>
      <Styled.StyledKey $type="object">{objKey}: </Styled.StyledKey>
      <TextRenderer>{objValue}</TextRenderer>
    </Styled.StyledRow>
  );
};

const Node: React.FC<CustomNodeProps> = ({ node, x, y }) => (
  <Styled.StyledForeignObject width={node.width} height={node.height} x={0} y={0} $isObject>
    {(node.text as Row[]).map((row, idx) => (
      <Row row={row} index={idx} x={x} y={y} key={idx} />
    ))}
  </Styled.StyledForeignObject>
);

function propsAreEqual(prev: CustomNodeProps, next: CustomNodeProps) {
  return String(prev.node.text) === String(next.node.text) && prev.node.width === next.node.width;
}

export default React.memo(Node, propsAreEqual);