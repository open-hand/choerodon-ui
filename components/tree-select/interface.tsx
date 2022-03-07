import { ReactNode } from 'react';
import { AbstractSelectProps, SelectValue } from '../select';

export interface TreeData {
  key: string;
  value: string;
  label: ReactNode;
  children?: TreeData[];
}

export interface TreeSelectProps extends AbstractSelectProps {
  value?: string | Array<any>;
  defaultValue?: string | Array<any>;
  multiple?: boolean;
  onSelect?: (value: any) => void;
  onChange?: (value: any, label: any) => void;
  onSearch?: (value: any) => void;
  searchPlaceholder?: string;
  treeDefaultExpandAll?: boolean;
  treeCheckable?: boolean | ReactNode;
  treeDefaultExpandedKeys?: Array<string>;
  filterTreeNode?: (inputValue: string, treeNode: any) => boolean | boolean;
  treeNodeFilterProp?: string;
  treeNodeLabelProp?: string;
  treeData?: Array<TreeData>;
  treeDataSimpleMode?: boolean | Record<string, any>;
  loadData?: (node: any) => void;
  showCheckedStrategy?: 'SHOW_ALL' | 'SHOW_PARENT' | 'SHOW_CHILD';
  labelInValue?: boolean;
  treeCheckStrictly?: boolean;
  getPopupContainer?: (triggerNode: Element) => HTMLElement;
  searchValue?: string;
  /**
   * 多值标签
   */
  maxTagTextLength?: number;
  maxTagCount?: number;
  maxTagPlaceholder?: ReactNode | ((omittedValues: SelectValue[]) => ReactNode);
}
