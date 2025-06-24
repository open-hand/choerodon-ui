import React, { Component } from 'react';
import classNames from 'classnames';
import { TreeSelectProps } from './interface';
import { SelectLocale } from '../select';
import LocaleReceiver from '../locale-provider/LocaleReceiver';
import { getRuntimeLocale } from '../locale-provider/utils';
import warning from '../_util/warning';
import RcTreeSelect, {
  SHOW_ALL,
  SHOW_CHILD,
  SHOW_PARENT,
  TreeNode,
} from '../rc-components/tree-select';
import { Size } from '../_util/enum';
import ConfigContext, { ConfigContextValue } from '../config-provider/ConfigContext';

export { TreeData, TreeSelectProps } from './interface';

export default class TreeSelect extends Component<TreeSelectProps, any> {
  static get contextType(): typeof ConfigContext {
    return ConfigContext;
  }

  static displayName = 'TreeSelect';

  static TreeNode = TreeNode;

  static SHOW_ALL = SHOW_ALL;

  static SHOW_PARENT = SHOW_PARENT;

  static SHOW_CHILD = SHOW_CHILD;

  static defaultProps = {
    transitionName: 'slide-up',
    choiceTransitionName: 'zoom',
    showSearch: false,
  };

  context: ConfigContextValue;

  private rcTreeSelect: any;

  constructor(props: TreeSelectProps) {
    super(props);

    warning(
      props.multiple !== false || !props.treeCheckable,
      '`multiple` will alway be `true` when `treeCheckable` is true',
    );
  }

  focus() {
    this.rcTreeSelect.focus();
  }

  blur() {
    this.rcTreeSelect.blur();
  }

  saveTreeSelect = (node: RcTreeSelect | null) => {
    this.rcTreeSelect = node;
  };

  renderTreeSelect = (locale: SelectLocale) => {
    const {
      prefixCls: customizePrefixCls,
      className,
      size,
      notFoundContent,
      dropdownStyle,
      dropdownClassName,
      ...restProps
    } = this.props;
    const { getPrefixCls } = this.context;

    const prefixCls = getPrefixCls('select', customizePrefixCls);
    const cls = classNames(
      {
        [`${prefixCls}-lg`]: size === Size.large,
        [`${prefixCls}-sm`]: size === Size.small,
      },
      className,
    );

    let checkable = restProps.treeCheckable;
    if (checkable) {
      checkable = <span className={`${prefixCls}-tree-checkbox-inner`} />;
    }
    return (
      <RcTreeSelect
        {...restProps}
        dropdownClassName={classNames(dropdownClassName, `${prefixCls}-tree-dropdown`)}
        prefixCls={prefixCls}
        className={cls}
        dropdownStyle={{ maxHeight: '100vh', overflow: 'auto', ...dropdownStyle }}
        treeCheckable={checkable}
        notFoundContent={notFoundContent || locale.notFoundContent}
        ref={this.saveTreeSelect}
      />
    );
  };

  render() {
    return (
      <LocaleReceiver componentName="Select" defaultLocale={getRuntimeLocale().Select || {}}>
        {this.renderTreeSelect}
      </LocaleReceiver>
    );
  }
}
