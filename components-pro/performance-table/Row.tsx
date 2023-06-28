// @ts-nocheck
import * as React from 'react';
import classNames from 'classnames';
import { DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd';
import { defaultClassPrefix, getUnhandledProps, prefix } from './utils';
import TableContext from './TableContext';
import { StandardProps } from './common';

export interface RowProps extends StandardProps {
  width?: number;
  height?: number;
  headerHeight?: number;
  top?: number;
  isHeaderRow?: boolean;
  rowDraggable?: boolean;
  rowRef?: React.Ref<any>;
  provided?: DraggableProvided;
  snapshot?: DraggableStateSnapshot;
}

const propTypeKeys = [
  'width',
  'height',
  'headerHeight',
  'top',
  'isHeaderRow',
  'rowDraggable',
  'rowRef',
  'className',
  'classPrefix',
  'style',
  'provided',
  'snapshot',
];

class Row extends React.PureComponent<RowProps> {
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

    const unhandledProps = getUnhandledProps(propTypeKeys, rest);

    return (
      <TableContext.Consumer>
        {({ translateDOMPositionXY }) => {
          if (translateDOMPositionXY) {
            translateDOMPositionXY(styles, 0, top);
          }
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
              zIndex: snapshot.isDragging ? 999 : styles.zIndex,
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
