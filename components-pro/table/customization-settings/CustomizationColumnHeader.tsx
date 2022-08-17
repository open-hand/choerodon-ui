import React, { FunctionComponent, useCallback, memo, useContext } from 'react';
import { FuncType } from '../../button/enum';
import { Size } from '../../core/enum';
import Button from '../../button/Button';
import TableContext, { TableContextValue } from '../TableContext';

export interface CustomizationColumnHeaderProps {
  onHeaderClick: (context: TableContextValue) => void;
}

const CustomizationColumnHeader: FunctionComponent<CustomizationColumnHeaderProps> = function CustomizationColumnHeader(props) {
  const { onHeaderClick } = props;
  const context = useContext(TableContext);
  const openCustomizationModal = useCallback(() => onHeaderClick(context), [context, onHeaderClick]);
  return (
    <Button funcType={FuncType.flat} size={Size.small} icon="predefine" onClick={openCustomizationModal} />
  );
};

CustomizationColumnHeader.displayName = 'CustomizationColumnHeader';

export default memo(CustomizationColumnHeader);
