import { FC } from "react";
import { styled } from "styled-components";
import * as Styled from "./styles";

const StyledRow = styled.span`
  display: inline-flex;
  align-items: center;
  overflow: hidden;
  gap: 4px;
  vertical-align: middle;
`;

function isColorFormat(colorString: string) {
  const hexCodeRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  const rgbRegex = /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/;
  const rgbaRegex = /^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(0|1|0\.\d+)\s*\)$/;

  return (
    hexCodeRegex.test(colorString) || rgbRegex.test(colorString) || rgbaRegex.test(colorString)
  );
}

const isURL =
  /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;

export const TextRenderer: FC<{ children: string }> = ({ children }) => {
  if (isURL.test(children.replace(/"/g, ""))) {
    return <Styled.StyledLinkItUrl>{children}</Styled.StyledLinkItUrl>;
  }

  if (isColorFormat(children.replace(/"/g, ""))) {
    return <StyledRow>{children.replace(/"/g, "")}</StyledRow>;
  }
  return <>{children}</>;
};