import React, { ForwardRefExoticComponent, PropsWithoutRef, RefAttributes } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { ColumnGroupProps } from './ColumnGroup.d';
import { defaultClassPrefix, prefix } from './utils';

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
    ...rest
  } = props;
  const height = headerHeight / 2;
  const styles: React.CSSProperties = {
    height,
    width,
    left
  };
  const contentStyles = { ...styles, verticalAlign };

  const addPrefix = (name: string) => prefix(classPrefix!)(name);

  return (
    <div ref={ref} className={classNames(classPrefix, className)} {...rest}>
      <div className={addPrefix('header')} style={styles}>
        <div className={addPrefix('header-content')} style={contentStyles}>
          {header}
        </div>
      </div>

      {React.Children.map(children, (node: React.ReactElement) => {
        const nodeStyles = { ...node.props?.style, top: styles.height, left: styles.left, };
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

ColumnGroup.propTypes = {
  header: PropTypes.node,
  classPrefix: PropTypes.string,
  verticalAlign: PropTypes.oneOf(['top', 'middle', 'bottom']),
};

export default ColumnGroup;
