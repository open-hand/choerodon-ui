import * as React from 'react';
import { action, computed, observable, runInAction } from 'mobx';
import { getConfig, getProPrefixCls } from 'choerodon-ui/lib/configure';
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
    return this.props.queryBar || getConfig('queryBar');
  }

  // @computed
  // get queryBarProps(): TableQueryBarHookProps {
  //   return this.props.queryBarProps || getConfig('queryBar');
  // }

  @computed
  get dataSet(): DataSet {
    return this.props.queryBar?.dataSet;
  }

  @action
  setProps(props) {
    this.props = props;
  }

  @action
  updateProps(props) {
    this.setProps(props);
  }

  @computed
  get prefixCls() {
    const { classPrefix } = this.props;
    return classPrefix;
  }

  @computed
  get proPrefixCls() {
    return getProPrefixCls('table');
  }

  constructor(node) {
    runInAction(() => {
      this.node = node;
      this.setProps(node.props);
    });
  }
}
