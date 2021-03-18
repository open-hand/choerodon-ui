import React, { FunctionComponent, useCallback } from 'react';
import { FuncType } from '../../button/enum';
import { Size } from '../../core/enum';
import Button from '../../button/Button';
import useModal from '../../use-modal';

export interface CustomizationColumnHeaderProps {
  onHeaderClick: (modal: { open: Function }) => void;
}

const CustomizationColumnHeader: FunctionComponent<CustomizationColumnHeaderProps> = (props) => {
  const { onHeaderClick } = props;
  const modal = useModal();
  const openCustomizationModal = useCallback(() => onHeaderClick(modal), [modal, onHeaderClick]);
  return (
    <Button funcType={FuncType.flat} size={Size.small} icon="settings" onClick={openCustomizationModal} />
  );
};

CustomizationColumnHeader.displayName = 'CustomizationColumnHeader';

export default CustomizationColumnHeader;
