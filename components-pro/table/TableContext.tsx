import React from 'react';
import TableStore from './TableStore';

export interface TableContextValue {
  tableStore: TableStore
}

export default React.createContext<TableContextValue>({ tableStore: {} as TableStore });
