import React, { Component, ComponentClass } from 'react';
import classnames from 'classnames';
import omit from 'lodash/omit';
import { Store } from './createStore';

interface BodyRowProps {
  store: Store;
  className?: string;
  rowKey: string;
  prefixCls: string;
}

interface BodyRowState {
  selected: boolean;
}

export interface BodyRowClass extends ComponentClass {}

export default function createTableRow(Cmp = 'tr') {
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
      const { state } = this;
      const { store, rowKey } = this.props;
      this.unsubscribe = store.subscribe(() => {
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
      const otherProps: any = omit(props, ['prefixCls', 'rowKey', 'store', 'children']);
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
