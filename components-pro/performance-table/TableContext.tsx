import createContext from './utils/createContext';
import translateDOMPositionXY from './utils/translateDOMPositionXY';
import isRTL from './utils/isRTL';
import TableStore from './TableStore';

export interface Props {
  rtl: boolean;
  hasCustomTreeCol: boolean;
  isTree: boolean;
  translateDOMPositionXY: null | ((style: React.CSSProperties, x: number, y: number) => void);
  tableStore: TableStore;
}

const TableContext = createContext<Props>({
  rlt: isRTL(),
  hasCustomTreeCol: false,
  isTree: false,
  translateDOMPositionXY,
});

export default TableContext;
