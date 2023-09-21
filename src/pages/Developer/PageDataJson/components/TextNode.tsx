import { FC, memo, MouseEvent } from "react";
import styled from "styled-components";

import useToggleHide from "hooks/useToggleHide";
import { useExternal } from "store/useExternal";
import { useInternal } from "store/useInternal";
import { CustomNodeProps } from "../interface";
import { TextRenderer } from "./TextRenderer";
import * as Styled from "./styles";
import { isContentImage } from "../utils/graph/calcNodeSize";

const MdLink = () => (
  <svg
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    viewBox="0 0 24 24"
    height="18px"
    width="18px"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path fill="none" d="M0 0h24v24H0z"></path>
    <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"></path>
  </svg>
);

const MdLinkOff = () => (
  <svg
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    viewBox="0 0 24 24"
    height="18px"
    width="18px"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path fill="none" d="M0 0h24v24H0V0z"></path>
    <path d="M17 7h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1 0 1.43-.98 2.63-2.31 2.98l1.46 1.46C20.88 15.61 22 13.95 22 12c0-2.76-2.24-5-5-5zm-1 4h-2.19l2 2H16zM2 4.27l3.11 3.11A4.991 4.991 0 002 12c0 2.76 2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1 0-1.59 1.21-2.9 2.76-3.07L8.73 11H8v2h2.73L13 15.27V17h1.73l4.01 4L20 19.74 3.27 3 2 4.27z"></path>
    <path fill="none" d="M0 24V0"></path>
  </svg>
);

const StyledExpand = styled.button`
  pointer-events: all;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.TEXT_NORMAL};
  background: rgba(0, 0, 0, 0.1);
  height: 100%;
  width: 40px;
  border-left: 1px solid ${({ theme }) => theme.BACKGROUND_MODIFIER_ACCENT};

  &:hover {
    background-image: linear-gradient(rgba(0, 0, 0, 0.1) 0 0);
  }
`;

const StyledTextNodeWrapper = styled.span<{ $hasCollapse: boolean }>`
  display: flex;
  justify-content: ${({ $hasCollapse }) => ($hasCollapse ? "space-between" : "center")};
  align-items: center;
  height: 100%;
  width: 100%;
`;

const StyledImageWrapper = styled.div`
  padding: 5px;
`;

const StyledImage = styled.img`
  border-radius: 2px;
  object-fit: contain;
  background: ${({ theme }) => theme.BACKGROUND_MODIFIER_ACCENT};
`;

const Node: FC<CustomNodeProps> = ({ node, x, y, hasCollapse = false }) => {
  const {
    id,
    text,
    width,
    height,
    data: { isParent, childrenCount, type },
  } = node;
  const { validateHiddenNodes } = useToggleHide();
  const hideCollapse = useExternal(state => state.hideCollapseButton);
  const showChildrenCount = useExternal(state => !state.hideChildrenCount);
  const imagePreview = useExternal(state => !state.disableImagePreview);
  const expandNodes = useInternal(state => state.expandNodes);
  const collapseNodes = useInternal(state => state.collapseNodes);
  const isExpanded = useInternal(state => state.collapsedParents.includes(id));
  const isImage = imagePreview && isContentImage(text as string);

  const handleExpand = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (!isExpanded) collapseNodes(id);
    else expandNodes(id);
    validateHiddenNodes();
  };

  return (
    <Styled.StyledForeignObject width={width} height={height} x={0} y={0}>
      {isImage ? (
        <StyledImageWrapper>
          <StyledImage src={text as string} width="70" height="70" loading="lazy" />
        </StyledImageWrapper>
      ) : (
        <StyledTextNodeWrapper
          data-x={x}
          data-y={y}
          data-key={JSON.stringify(text)}
          $hasCollapse={isParent && !hideCollapse}
        >
          <Styled.StyledKey $parent={isParent} $type={type}>
            <TextRenderer>{JSON.stringify(text).replace(/"/g, "")}</TextRenderer>
          </Styled.StyledKey>
          {isParent && childrenCount > 0 && showChildrenCount && (
            <Styled.StyledChildrenCount>({childrenCount})</Styled.StyledChildrenCount>
          )}

          {isParent && hasCollapse && !hideCollapse && (
            <StyledExpand aria-label="Expand" onClick={handleExpand}>
              {isExpanded ? <MdLinkOff /> : <MdLink />}
            </StyledExpand>
          )}
        </StyledTextNodeWrapper>
      )}
    </Styled.StyledForeignObject>
  );
};

function propsAreEqual(prev: CustomNodeProps, next: CustomNodeProps) {
  return (
    prev.node.text === next.node.text &&
    prev.node.width === next.node.width &&
    prev.node.data.childrenCount === next.node.data.childrenCount
  );
}

export default memo(Node, propsAreEqual);