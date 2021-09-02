import React, { FunctionComponent, ReactNode } from 'react';
import { observer } from 'mobx-react-lite';
import TableStore from './TableStore';
import DataSet from '../data-set/DataSet';
import Record from '../data-set/Record';
import { DragRender, expandedRowRendererProps, onResizeProps, onRowProps } from './Table';
import { SelectionMode } from './enum';
import ModalProvider from '../modal-provider';

export interface TableContextProviderProps {
  code?: string;
  prefixCls?: string;
  pristine?: boolean;
  tableStore: TableStore;
  dataSet: DataSet;
  indentSize: number;
  selectionMode?: SelectionMode;
  onRow?: (props: onRowProps) => object;
  onResize?: (props: onResizeProps) => void;
  rowRenderer?: (record: Record, index: number) => object;
  expandedRowRenderer?: (props: expandedRowRendererProps) => ReactNode;
  expandRowByClick?: boolean;
  rowDragRender?: DragRender;
  columnsDragRender?: DragRender;
  isTree?: boolean;
  showSelectionCachedButton?: boolean;
  onShowCachedSelectionChange?: (showCachedSelection: boolean) => void;
  autoMaxWidth?: boolean;
  summary?: string;
}

export interface TableContextValue extends TableContextProviderProps {
  border?: boolean;
  columnEditorBorder?: boolean;
  aggregation?: boolean;
  inlineEdit?: boolean;
  checkField?: string;
  expandIconAsCell?: boolean;
  canTreeLoadData?: boolean;
  parityRow?: boolean;
  rowHeight: 'auto' | number;
}

const TableContext = React.createContext<TableContextValue>({
  tableStore: {} as TableStore,
  dataSet: {} as DataSet,
  indentSize: 15,
  rowHeight: 30,
});

const TableContextProvider: FunctionComponent<TableContextProviderProps> = observer((props) => {
  const { children, tableStore, dataSet, ...other } = props;

  const value = {
    ...other,
    dataSet,
    tableStore,
    border: tableStore.border,
    columnEditorBorder: tableStore.columnEditorBorder,
    rowHeight: tableStore.rowHeight,
    aggregation: tableStore.aggregation,
    inlineEdit: tableStore.inlineEdit,
    expandIconAsCell: tableStore.expandIconAsCell,
    canTreeLoadData: tableStore.canTreeLoadData,
    parityRow: tableStore.parityRow,
    checkField: dataSet.props.checkField,
  };

  return (
    <TableContext.Provider value={value}>
      {
        tableStore.customizable ? (
          <ModalProvider>
            {children}
          </ModalProvider>
        ) : children
      }
    </TableContext.Provider>
  );
});

TableContextProvider.displayName = 'TableContextProvider';

export default TableContext;

export {
  TableContextProvider,
};
