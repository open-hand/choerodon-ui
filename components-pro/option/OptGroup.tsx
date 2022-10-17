import { Component, ReactNode } from 'react';

export interface OptGroupProps {
  /**
   * 选项组标题
   */
  label?: string;
  children?: ReactNode;
}

/* eslint-disable react/prefer-stateless-function,react/no-unused-prop-types */
export default class OptGroup extends Component<OptGroupProps> {
  static __PRO_OPT_GROUP = true;
}
