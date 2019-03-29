import { Component, ComponentState, ReactNode } from 'react';

export interface ColumnGroupProps {
  title?: ReactNode;
}

export default class ColumnGroup extends Component<ColumnGroupProps, ComponentState> {
  static __ANT_TABLE_COLUMN_GROUP = true;
}
