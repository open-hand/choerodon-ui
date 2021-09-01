// @ts-nocheck
import * as React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { defaultClassPrefix, getUnhandledProps, prefix } from './utils';
import { CellGroupProps } from './CellGroup.d';
import TableContext from './TableContext';

const propTypes = {
  fixed: PropTypes.oneOf(['left', 'right']),
  width: PropTypes.number,
  height: PropTypes.number,
  left: PropTypes.number,
  style: PropTypes.object,
  className: PropTypes.string,
  classPrefix: PropTypes.string,
  rowDraggable: PropTypes.bool,
  snapshot: PropTypes.object,
  provided: PropTypes.object,
};

class CellGroup extends React.PureComponent<CellGroupProps> {
  static propTypes = propTypes;

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
    const unhandledProps = getUnhandledProps(propTypes, rest);

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
          translateDOMPositionXY?.(styles, left, 0);
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
