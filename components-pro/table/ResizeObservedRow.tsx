import React, { Component, Key } from 'react';
import ReactResizeObserver from 'choerodon-ui/lib/_util/resizeObserver';
import autobind from '../_util/autobind';

export interface ResizeObservedRowProps {
  onResize: (rowIndex: Key, height: number) => void;
  rowIndex: Key;
}

export default class ResizeObservedRow extends Component<ResizeObservedRowProps> {

  @autobind
  handleResize(_width: number, height: number) {
    const { onResize, rowIndex } = this.props;
    onResize(rowIndex, height);
  }

  render() {
    const { children } = this.props;
    return (
      <ReactResizeObserver resizeProp="height" onResize={this.handleResize}>
        {children}
      </ReactResizeObserver>
    );
  }
}
