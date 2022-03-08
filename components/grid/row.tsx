import React, { Children, cloneElement, HTMLAttributes, PureComponent, ReactElement } from 'react';
import classNames from 'classnames';
import omit from 'lodash/omit';
import Responsive, { BreakpointMap } from '../responsive/Responsive';
import ConfigContext, { ConfigContextValue } from '../config-provider/ConfigContext';

export interface RowProps extends HTMLAttributes<HTMLDivElement> {
  gutter?: number | BreakpointMap;
  type?: 'flex';
  align?: 'top' | 'middle' | 'bottom';
  justify?: 'start' | 'end' | 'center' | 'space-around' | 'space-between';
  prefixCls?: string;
}

const defaultGutter = 0;

export default class Row extends PureComponent<RowProps> {
  static displayName = 'Row';

  static get contextType(): typeof ConfigContext {
    return ConfigContext;
  }

  static defaultProps = {
    gutter: defaultGutter,
  };

  context: ConfigContextValue;

  renderRow = ([gutter = defaultGutter]) => {
    const {
      type,
      justify,
      align,
      className,
      style,
      children,
      prefixCls: customizePrefixCls,
      ...others
    } = this.props;
    const { getPrefixCls } = this.context;
    const prefixCls = getPrefixCls('row', customizePrefixCls);
    const classes = classNames(
      {
        [prefixCls]: !type,
        [`${prefixCls}-${type}`]: type,
        [`${prefixCls}-${type}-${justify}`]: type && justify,
        [`${prefixCls}-${type}-${align}`]: type && align,
      },
      className,
    );
    const rowStyle =
      (gutter as number) > 0
        ? {
          marginLeft: (gutter as number) / -2,
          marginRight: (gutter as number) / -2,
          ...style,
        }
        : style;
    const cols = Children.map(children, (col: ReactElement<HTMLDivElement>) => {
      if (!col) {
        return null;
      }
      if (col.props && (gutter as number) > 0) {
        return cloneElement(col, {
          style: {
            paddingLeft: (gutter as number) / 2,
            paddingRight: (gutter as number) / 2,
            ...col.props.style,
          },
        });
      }
      return col;
    });
    const otherProps = { ...others };
    delete otherProps.gutter;
    return (
      <div {...omit(otherProps, ['rowIndex', 'colIndex'])} className={classes} style={rowStyle}>
        {cols}
      </div>
    );
  };

  render() {
    const { gutter } = this.props;
    return <Responsive items={[gutter]}>{this.renderRow}</Responsive>;
  }
}
