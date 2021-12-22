import React, { FunctionComponent, useContext, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import TableTBody, { TableTBodyProps } from './TableTBody';
import TableContext from './TableContext';

const ExpandableTableTBody: FunctionComponent<TableTBodyProps> = function ExpandableTableTBody(props) {
  const { tableStore: { isBodyExpanded } } = useContext(TableContext);
  const rendered = useRef<boolean>(false);
  if (isBodyExpanded || rendered.current) {
    rendered.current = true;
    return (
      <TableTBody {...props} hidden={!isBodyExpanded} />
    );
  }
  return null;
};

ExpandableTableTBody.displayName = 'ExpandableTableTBody';

export default observer(ExpandableTableTBody);
