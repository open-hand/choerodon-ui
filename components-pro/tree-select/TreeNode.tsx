import { Component } from 'react';
import { ViewComponentProps } from '../core/ViewComponent';

export interface TreeNodeProps extends ViewComponentProps {
  /**
   * 选项值
   */
  value?: any;
  /**
   * 显示值
   */
  title?: any;
}

/* eslint-disable react/prefer-stateless-function,react/no-unused-prop-types */
export default class TreeNode extends Component<TreeNodeProps, any> {
  static __PRO_TREE_SELECT_NODE = true;
}
