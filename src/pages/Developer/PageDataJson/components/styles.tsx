import styled, { DefaultTheme } from 'styled-components';
import { NodeType } from "jsonc-parser";
import { LinkItUrl } from "react-linkify-it";

export const StyledEditorWrapper = styled.div`
  * {
    font-family: Menlo, monospace;
  }
  position: relative;
  overflow: hidden;

  .hide {
    display: none;
  }

  button {
    border: none;
    outline: none;
    cursor: pointer;
  }

  :active {
    cursor: move;
  }

  .dragging,
  .dragging button {
    pointer-events: none;
  }

  rect {
    fill: ${({ theme }) => theme.BACKGROUND_NODE};
  }

  --bg-color: ${({ theme }) => theme.GRID_BG_COLOR};
  --line-color-1: ${({ theme }) => theme.GRID_COLOR_PRIMARY};
  --line-color-2: ${({ theme }) => theme.GRID_COLOR_SECONDARY};

  background-color: var(--bg-color);
  background-image: linear-gradient(var(--line-color-1) 1.5px, transparent 1.5px),
    linear-gradient(90deg, var(--line-color-1) 1.5px, transparent 1.5px),
    linear-gradient(var(--line-color-2) 1px, transparent 1px),
    linear-gradient(90deg, var(--line-color-2) 1px, transparent 1px);
  background-position:
    -1.5px -1.5px,
    -1.5px -1.5px,
    -1px -1px,
    -1px -1px;
  background-size:
    100px 100px,
    100px 100px,
    20px 20px,
    20px 20px;
`;

function getTypeColor(value: string, theme: DefaultTheme) {
  if (!Number.isNaN(+value)) return theme.NODE_COLORS.INTEGER;
  if (value === "true") return theme.NODE_COLORS.BOOL.TRUE;
  if (value === "false") return theme.NODE_COLORS.BOOL.FALSE;
  if (value === "null") return theme.NODE_COLORS.NULL;
  return theme.NODE_COLORS.NODE_VALUE;
}

function getKeyColor(theme: DefaultTheme, parent: boolean, type: NodeType) {
  if (parent) {
    if (type === "array") return theme.NODE_COLORS.PARENT_ARR;
    return theme.NODE_COLORS.PARENT_OBJ;
  }
  if (type === "object") return theme.NODE_COLORS.NODE_KEY;
  return theme.NODE_COLORS.TEXT;
}

export const StyledLinkItUrl = styled(LinkItUrl)`
  text-decoration: underline;
  pointer-events: all;
`;

export const StyledForeignObject = styled.foreignObject<{ $isObject?: boolean }>`
  text-align: ${({ $isObject }) => !$isObject && "center"};
  font-size: 10px;
  overflow: hidden;
  color: ${({ theme }) => theme.NODE_COLORS.TEXT};
  pointer-events: none;
  font-weight: 500;
  font-family: "Menlo", monospace;

  &.searched {
    background: rgba(27, 255, 0, 0.1);
    border: 2px solid ${({ theme }) => theme.TEXT_POSITIVE};
    border-radius: 2px;
    box-sizing: border-box;
  }

  .highlight {
    background: rgba(255, 214, 0, 0.3);
  }

  .renderVisible {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 12px;
    width: 100%;
    height: 100%;
    overflow: hidden;
    cursor: pointer;
  }
`;

export const StyledKey = styled.span<{ $parent?: boolean; $type?: NodeType }>`
  display: inline;
  flex: 1;
  color: ${({ theme, $type = "null", $parent = false }) => getKeyColor(theme, $parent, $type)};
  font-size: ${({ $parent }) => $parent && "12px"};
  overflow: hidden;
  text-overflow: ellipsis;
  padding: ${({ $type }) => $type !== "object" && "10px"};
  white-space: nowrap;
`;

export const StyledRow = styled.span<{ $type: string }>`
  padding: 0 10px;
  color: ${({ theme, $type }) => getTypeColor($type, theme)};
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.5;

  &:first-of-type {
    padding-top: 10px;
  }

  &:last-of-type {
    padding-bottom: 10px;
  }
`;

export const StyledChildrenCount = styled.span`
  color: ${({ theme }) => theme.NODE_COLORS.CHILD_COUNT};
  padding: 10px;
  margin-left: -15px;
`;