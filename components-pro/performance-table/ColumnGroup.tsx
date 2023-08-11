import React, { ForwardRefExoticComponent, isValidElement, PropsWithoutRef, RefAttributes, useContext, useRef } from 'react';
import classNames from 'classnames';
import isString from 'lodash/isString';
import { defaultClassPrefix, prefix } from './utils';
import TableContext from './TableContext';

export interface ColumnGroupProps {
  align?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  fixed?: boolean | 'left' | 'right';
  width?: number;
  left?: number;
  headerLeft?: number;
  header?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  headerHeight?: number;
  classPrefix?: string; // Fixed ColumnGroup does not support `classPrefix`
}

export interface IColumnGroup extends ForwardRefExoticComponent<PropsWithoutRef<ColumnGroupProps> & RefAttributes<HTMLDivElement>> {
  __PRO_TABLE_COLUMN_GROUP?: boolean;
}

const ColumnGroup: IColumnGroup = React.forwardRef<HTMLDivElement, ColumnGroupProps>((props, ref) => {
  const {
    header,
    className,
    children,
    classPrefix,
    headerHeight = 80,
    verticalAlign,
    width,
    left,
    headerLeft = 0,
    fixed,
    ...rest
  } = props;
  const { scrollX, tableWidth = 0, tableStore } = useContext(TableContext);
  const groupHeaderRef = useRef<HTMLElement | null>(null);
  const { originalColumns } = tableStore;

  const height = headerHeight / 2;
  const styles: React.CSSProperties = {
    height,
    width,
    left,
  };
  const contentStyles = { ...styles, verticalAlign };

  const addPrefix = (name: string) => prefix(classPrefix!)(name);
  // 组合列 header 随滚动条滚动居中。
  let headerMiddleStyle: React.CSSProperties | undefined = undefined;
  if (groupHeaderRef && groupHeaderRef.current && !fixed) {
    const fixedWidth: { leftWidth: number; rightWidth: number } = originalColumns.reduce((prev, current) => {
      if (current.fixed === true || current.fixed === 'left') {
        prev.leftWidth = prev.leftWidth + (current.width || 0);
      } else if (current.fixed === 'right') {
        prev.rightWidth = prev.rightWidth + (current.width || 0);
      }
      return prev;
    }, { leftWidth: 0, rightWidth: 0 });
    const mathScrollX = Math.abs(scrollX);
    const calcTableWidth = tableWidth - fixedWidth.rightWidth;
    const mathPostionLeft = headerLeft - calcTableWidth;
    const leftDistanceFixed = headerLeft - fixedWidth.leftWidth;
    let positionLeft = 0;
    let beyondWidth = 0;
    if (mathScrollX > leftDistanceFixed) {
      beyondWidth = mathScrollX - leftDistanceFixed;
    }
    if (mathScrollX > mathPostionLeft && width) {
      let percent = calcTableWidth + mathScrollX - headerLeft + (beyondWidth > 0 ? beyondWidth : 0);
      if (mathScrollX + calcTableWidth > headerLeft + width) {
        percent -= ((mathScrollX + calcTableWidth) - (headerLeft + width));
      }
      const getHeaderWidth = groupHeaderRef.current.offsetWidth;
      const minLeft = getHeaderWidth / 2;
      const maxLeft = width - getHeaderWidth / 2;
      positionLeft = percent > 0 && (percent / 2 < width) ? percent / 2 : 0;
      if (positionLeft < minLeft) {
        positionLeft = minLeft;
      } else if (positionLeft > maxLeft) {
        positionLeft = maxLeft;
      }
    }
    headerMiddleStyle = {
      position: 'absolute',
      top: '50%',
      left: positionLeft ? positionLeft : '50%',
      transform: 'translate(-50%, -50%)'
    };
  }
 
  return (
    <div ref={ref} className={classNames(classPrefix, className)} {...rest}>
      <div className={addPrefix('header')} style={styles}>
        <div className={addPrefix('header-content')} style={contentStyles}>
          {
            isString(header) ?
              <span style={headerMiddleStyle} ref={groupHeaderRef}>{header}</span> :
              isValidElement(header) ? React.cloneElement(header) : header
          }
        </div>
      </div>

      {React.Children.map(children, (node: React.ReactElement) => {
        const nodeStyles = { ...node.props.style, top: styles.height, left: styles.left };
        return React.cloneElement(node, {
          className: addPrefix('cell'),
          style: nodeStyles,
          children: <span className={addPrefix('cell-content')}>{node.props.children}</span>
        });
      })}
    </div>
  );
});

ColumnGroup.displayName = 'ColumnGroup';

ColumnGroup.__PRO_TABLE_COLUMN_GROUP = true;

ColumnGroup.defaultProps = {
  headerHeight: 80,
  classPrefix: defaultClassPrefix('performance-table-column-group'),
};

export default ColumnGroup;
