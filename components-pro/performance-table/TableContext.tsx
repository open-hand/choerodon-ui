import { CSSProperties } from 'react';
import { getContext, Symbols } from 'choerodon-ui/shared';
import translateDOMPositionXY from './utils/translateDOMPositionXY';
import isRTL from './utils/isRTL';
import TableStore from './TableStore';

export interface Props {
  rtl: boolean;
  hasCustomTreeCol: boolean;
  isTree: boolean;
  translateDOMPositionXY: null | ((style: CSSProperties, x: number, y: number) => void);
  tableStore: TableStore;
}

const TableContext = getContext<Props>(Symbols.ProPerformanceTableContext, {
  rtl: isRTL(),
  hasCustomTreeCol: false,
  isTree: false,
  translateDOMPositionXY,
  tableStore: {} as TableStore,
});

export default TableContext;
