import React, { Component, ReactElement } from 'react';
import Trigger from 'choerodon-ui/lib/trigger';
import DropdownMenu from './DropdownMenu';
import { OptionProps } from './Option';
import { Placement } from './Mentions';
import BUILT_IN_PLACEMENTS from '../trigger-field/placements';

interface KeywordTriggerProps {
  options: OptionProps[];
  prefixCls?: string;
  placement?: Placement;
  visible?: boolean;
  transitionName?: string;
  children?: ReactElement;
  getPopupContainer?: (triggerNode: Element) => HTMLElement;
}

class KeywordTrigger extends Component<KeywordTriggerProps, {}> {
  getDropdownElement() {
    const { options } = this.props;
    return <DropdownMenu options={options} />;
  }

  getDropDownPlacement() {
    const { placement } = this.props;
    const popupPlacement = placement === 'top' ? 'topLeft' : 'bottomLeft';
    return popupPlacement;
  }

  render() {
    const { children, visible, getPopupContainer, prefixCls } = this.props;
    const popupElement = this.getDropdownElement();

    return (
      <Trigger
        prefixCls={prefixCls}
        popupHidden={!visible}
        popupContent={popupElement}
        popupPlacement={this.getDropDownPlacement()}
        builtinPlacements={BUILT_IN_PLACEMENTS}
        getPopupContainer={getPopupContainer}
      >
        {children}
      </Trigger>
    );
  }
}

export default KeywordTrigger;
