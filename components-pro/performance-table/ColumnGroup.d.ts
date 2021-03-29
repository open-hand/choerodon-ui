export interface ColumnGroupProps {
  align?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  fixed?: boolean | 'left' | 'right';
  width?: number;
  header?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  headerHeight?: number;
  classPrefix?: string; // Fixed ColumnGroup does not support `classPrefix`
}

declare const ColumnGroup: React.ComponentType<ColumnGroupProps>;

export default ColumnGroup;
