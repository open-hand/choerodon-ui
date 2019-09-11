import React, { PureComponent, ReactNode } from 'react';
import Button from '../button/Button';
import { ButtonColor, FuncType } from '../button/enum';
import { PagerType } from './Pagination';

export interface PagerProps {
  page: number;
  active: boolean;
  disabled?: boolean;
  type: PagerType;
  className?: string;
  renderer: (page: number, type: PagerType) => ReactNode;
  onClick?: (page: number) => void;
}

export default class Pager extends PureComponent<PagerProps> {
  static displayName = 'Pager';

  handleClick = () => {
    const { page, onClick } = this.props;
    if (onClick) {
      onClick(page);
    }
  };

  render() {
    const { active, renderer, page, type, disabled, className } = this.props;
    return (
      <Button
        className={className}
        funcType={active ? FuncType.raised : FuncType.flat}
        onClick={this.handleClick}
        color={active ? ButtonColor.primary : undefined}
        disabled={disabled}
      >
        {renderer(page, type)}
      </Button>
    );
  }
}
