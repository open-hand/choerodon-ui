import { getContext, Symbols } from 'choerodon-ui/shared';

const TableRowContext = getContext(Symbols.TableRowContext, null);
export const InnerRowCtx = getContext(Symbols.TableInnerRowContext, null);

export default TableRowContext;
