import React, { FunctionComponent, ReactNode } from 'react';
import { observer } from 'mobx-react-lite';
import { GenerateRowProps } from './TableTBody';

export interface ExpandedRowProps extends GenerateRowProps {
  renderExpandedRows: (rowProps: GenerateRowProps) => ReactNode[];
}

const ExpandedRow: FunctionComponent<ExpandedRowProps> = function ExpandedRow(props) {
  const { renderExpandedRows } = props;
  const child = renderExpandedRows(props);
  if (child) {
    return (
      <>
        {child}
      </>
    );
  }
  return null;
};

ExpandedRow.displayName = 'ExpandedRow';

export default observer(ExpandedRow);
