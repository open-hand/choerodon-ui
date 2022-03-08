import React, { Component, ComponentClass, ReactNode, ReactHTML } from 'react';
import classnames from 'classnames';
import omit from 'lodash/omit';
import { Store } from './createStore';

interface BodyRowProps {
  store: Store;
  className?: string;
  rowKey: string;
  prefixCls: string;
  children?: ReactNode
}

interface BodyRowState {
  selected: boolean;
}

export type BodyRowClass = ComponentClass;

export default function createTableRow(Cmp: keyof ReactHTML = 'tr') {
  class BodyRow extends Component<BodyRowProps, BodyRowState> {
    private store: Store;

    private unsubscribe: () => void;

    constructor(props: BodyRowProps) {
      super(props);

      this.store = props.store;
      const { selectedRowKeys } = this.store.getState();

      this.state = {
        selected: selectedRowKeys.indexOf(props.rowKey) >= 0,
      };
    }

    componentDidMount() {
      this.subscribe();
    }

    componentWillUnmount() {
      if (this.unsubscribe) {
        this.unsubscribe();
      }
    }

    subscribe() {
      const { store, rowKey } = this.props;
      this.unsubscribe = store.subscribe(() => {
        const { state } = this;
        const { selectedRowKeys } = this.store.getState();
        const selected = selectedRowKeys.indexOf(rowKey) >= 0;
        if (selected !== state.selected) {
          this.setState({ selected });
        }
      });
    }

    render() {
      const { props } = this;
      const { selected } = this.state;
      const { className, prefixCls, children } = props;
      const omits: string[] = ['prefixCls', 'rowKey', 'store', 'children'];

      if (Cmp === 'tr') {
        omits.push('record');
      }
      const otherProps: any = omit(props, omits);
      const classString = classnames(className, {
        [`${prefixCls}-row-selected`]: selected,
      });

      return (
        <Cmp {...otherProps} className={classString}>
          {children}
        </Cmp>
      );
    }
  }

  return BodyRow as BodyRowClass;
}
