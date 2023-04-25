import React, { FunctionComponent, useCallback, memo, useContext } from 'react';
import { ButtonColor, FuncType } from '../../button/enum';
import { Size } from '../../core/enum';
import Button from '../../button/Button';
import TableContext, { TableContextValue } from '../TableContext';

export interface CustomizationColumnHeaderProps {
  onHeaderClick: (context: TableContextValue) => void;
  customizedBtn?: boolean | undefined;
}

const CustomizationColumnHeader: FunctionComponent<CustomizationColumnHeaderProps> = function CustomizationColumnHeader(props) {
  const { onHeaderClick, customizedBtn } = props;
  const context = useContext(TableContext);
  const openCustomizationModal = useCallback(() => onHeaderClick(context), [context, onHeaderClick]);
  return (
    <Button color={customizedBtn ? ButtonColor.primary : ButtonColor.default} funcType={FuncType.flat} size={Size.small} icon={customizedBtn ? "settings-o" : "predefine"} onClick={openCustomizationModal} />
  );
};

CustomizationColumnHeader.displayName = 'CustomizationColumnHeader';

export default memo(CustomizationColumnHeader);
