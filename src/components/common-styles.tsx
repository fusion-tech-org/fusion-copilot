import { Link } from 'react-router-dom';
import styled from 'styled-components';

export const MyLink = styled(Link)`
  display: flex;
  align-items: center;
  color: #333;
  transition: color 0.3s;
  text-decoration: none;

  &:hover {
    color: var(--theme-primary);
  }
`;
