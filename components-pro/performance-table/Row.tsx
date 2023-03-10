// @ts-nocheck
import * as React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { defaultClassPrefix, getUnhandledProps, prefix } from './utils';
import TableContext from './TableContext';
import { RowProps } from './Row.d';

const propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  headerHeight: PropTypes.number,
  top: PropTypes.number,
  isHeaderRow: PropTypes.bool,
  rowDraggable: PropTypes.bool,
  rowRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  className: PropTypes.string,
  classPrefix: PropTypes.string,
  style: PropTypes.object,
  provided: PropTypes.object,
  snapshot: PropTypes.object,
};

class Row extends React.PureComponent<RowProps> {
  static propTypes = propTypes;

  static defaultProps = {
    classPrefix: defaultClassPrefix('performance-table-row'),
    height: 46,
    headerHeight: 40,
  };

  render() {
    const {
      // todo
      // dragColumnAlign,
      className,
      width,
      height,
      top,
      style,
      isHeaderRow,
      headerHeight,
      rowRef,
      classPrefix,
      children,
      rowDraggable,
      provided,
      snapshot,
      ...rest
    } = this.props;

    const addPrefix = prefix(classPrefix);
    const classes = classNames(classPrefix, className, {
      [addPrefix('header')]: isHeaderRow,
    });

    let styles = {
      minWidth: width,
      height: isHeaderRow ? headerHeight : height,
      ...style,
    };

    const unhandledProps = getUnhandledProps(propTypes, rest);

    return (
      <TableContext.Consumer>
        {({ translateDOMPositionXY }) => {
          translateDOMPositionXY?.(styles, 0, top);
          const providedProps = {};
          let transform = styles.transform;
          if (rowDraggable && provided) {
            let regex = new RegExp('translate\\((.*?)px, (.*?)px\\)');
            let regex3d = new RegExp('translate3d\\((.*?)px,(.*?)px,(.*?)\\)');

            // the transform property of parent style gotten through reference and passed in as a prop
            let parentValues = regex3d.exec(styles.transform || '');
            let childValues = regex.exec(provided.draggableProps.style.transform || '');

            // if both the parent (the nested list) and the child (item beeing dragged) has transform values, recalculate the child items transform to account for position fixed not working
            if (childValues != null && parentValues != null) {
              let x = (parseFloat(childValues[1], 10));
              let y = (parseFloat(childValues[2], 10));
              let p_x = (parseFloat(parentValues[1], 10));
              let p_y = (parseFloat(parentValues[2], 10));
              let p_z = (parseFloat(parentValues[3], 10));
              transform = `translate3d(${x + p_x}px, ${y + p_y}px, ${p_z}px)`;
            }
            Object.assign(providedProps, provided.draggableProps, provided.dragHandleProps);
            styles = {
              ...styles,
              top: 'auto !important',
              left: 'auto !important',
              cursor: 'move',
              transform,
              // zIndex: snapshot.isDragging ? 999 : 1,
            };
          }
          return <div {...providedProps} role="row" {...unhandledProps} ref={rowRef} className={classes} style={styles}>
            {children}
          </div>;
        }}
      </TableContext.Consumer>
    );
  }
}

export default Row;
