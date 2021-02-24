import { Component } from 'react';
import PropTypes from 'prop-types';
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
  static propTypes = {
    /**
     * 选项值
     */
    value: PropTypes.any,
    /**
     * 显示值
     */
    title: PropTypes.any,
  };

  static __PRO_TREE_SELECT_NODE = true;
}
