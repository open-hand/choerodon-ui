// @ts-nocheck
import * as React from 'react';
import classNames from 'classnames';
import { DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd';
import { defaultClassPrefix, getUnhandledProps, prefix } from './utils';
import TableContext from './TableContext';

export interface CellGroupProps {
  fixed?: 'left' | 'right';
  width?: number;
  height?: number;
  left?: number;
  style?: React.CSSProperties;
  className?: string;
  classPrefix?: string;
  snapshot?: DraggableStateSnapshot;
  provided?: DraggableProvided;
  rowDraggable?: boolean;
}

const propTypeKeys = [
  'fixed',
  'width',
  'height',
  'left',
  'style',
  'className',
  'classPrefix',
  'rowDraggable',
  'snapshot',
  'provided',
];

class CellGroup extends React.PureComponent<CellGroupProps> {
  static defaultProps = {
    classPrefix: defaultClassPrefix('performance-table-cell-group'),
  };

  addPrefix = (name: string) => prefix(this.props.classPrefix)(name);

  render() {
    const {
      fixed,
      width,
      left,
      height,
      style,
      classPrefix,
      className,
      children,
      rowDraggable,
      provided,
      snapshot,
      ...rest
    } = this.props;
    const classes = classNames(classPrefix, className, {
      [this.addPrefix(`fixed-${fixed || ''}`)]: fixed,
      [this.addPrefix('scroll')]: !fixed,
    });
    const styles = {
      width,
      height,
      ...style,
    };
    const unhandledProps = getUnhandledProps(propTypeKeys, rest);

    let childArr = [];
    if (rowDraggable) {
      React.Children.forEach(children, child => {
        childArr.push(React.cloneElement(child, {
          provided,
          isDragging: snapshot ? snapshot.isDragging : false,
        }));
      });
    }

    const cloneChildren = rowDraggable ? childArr : children;

    return (
      <TableContext.Consumer>
        {({ translateDOMPositionXY }) => {
          if (translateDOMPositionXY && !fixed) {
            translateDOMPositionXY(styles, left, 0);
          }
          return (
            <div {...unhandledProps} className={classes} style={styles}>
              {cloneChildren}
            </div>
          );
        }}
      </TableContext.Consumer>
    );
  }
}

export default CellGroup;
