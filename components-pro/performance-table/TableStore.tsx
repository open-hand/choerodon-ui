import React from 'react';
import { action, computed, observable, runInAction } from 'mobx';
import { getProPrefixCls } from 'choerodon-ui/lib/configure';
import DataSet from '../data-set';
import { TableQueryBarHookProps } from './Table.d';
import { ColumnProps } from './Column.d';

export default class TableStore {
  node: any;

  searchText: string;

  highlightRowIndexs: number[] = [];

  @observable props: any;

  @observable originalColumns: React.ReactElement<ColumnProps>[];

  @computed
  get queryBar(): TableQueryBarHookProps {
    return this.node.props.queryBar;
  }

  @computed
  get dataSet(): DataSet {
    return this.node.props.queryBar?.dataSet;
  }

  @action
  updateProps(node) {
    // this.setProps(props);
    this.node = node;
  }

  @computed
  get prefixCls() {
    const { classPrefix } = this.node.props;
    return classPrefix;
  }

  @computed
  get proPrefixCls() {
    return getProPrefixCls('table');
  }

  constructor(node) {
    runInAction(() => {
      // this.setProps(node.props);
      this.node = node;
    });
  }
}
