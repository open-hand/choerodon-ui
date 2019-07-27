import React from 'react';
import TableStore from './TableStore';

export default React.createContext<{ tableStore: TableStore }>({} as any);
