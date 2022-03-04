import React, { Component } from 'react';
import Checkbox from '../checkbox';
import Radio from '../radio';
import { SelectionBoxProps, SelectionBoxState } from './interface';

export default class SelectionBox extends Component<SelectionBoxProps, SelectionBoxState> {
  unsubscribe: () => void;

  constructor(props: SelectionBoxProps) {
    super(props);

    this.state = {
      checked: this.getCheckState(props),
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
    const { store } = this.props;
    this.unsubscribe = store.subscribe(() => {
      const checked = this.getCheckState(this.props);
      this.setState({ checked });
    });
  }

  getCheckState(props: SelectionBoxProps) {
    const { store, defaultSelection, rowIndex } = props;
    let checked = false;
    if (store.getState().selectionDirty) {
      checked = store.getState().selectedRowKeys.indexOf(rowIndex) >= 0;
    } else {
      checked =
        store.getState().selectedRowKeys.indexOf(rowIndex) >= 0 ||
        defaultSelection.indexOf(rowIndex) >= 0;
    }
    return checked;
  }

  render() {
    const { type, rowIndex, radioPrefixCls, checkboxPrefixCls, ...rest } = this.props;
    const { checked } = this.state;

    if (type === 'radio') {
      return <Radio prefixCls={radioPrefixCls} checked={checked} value={rowIndex} {...rest} />;
    }
    return <Checkbox prefixCls={checkboxPrefixCls} checked={checked} {...rest} />;
  }
}
