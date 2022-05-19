import React, {
  cloneElement,
  CSSProperties,
  FunctionComponent,
  isValidElement,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import ConfigContext from 'choerodon-ui/lib/config-provider/ConfigContext';
import Trigger, { RenderFunction } from 'choerodon-ui/lib/trigger/Trigger';
import { Action } from 'choerodon-ui/lib/trigger/enum';
import DropdownButton from './DropdownButton';
import { Placements } from './enum';
import builtinPlacements from './placements';

const popupStyle: CSSProperties = { whiteSpace: 'nowrap' };

export interface DropDownProps {
  trigger?: Action[];
  overlay: ReactNode | RenderFunction;
  onHiddenChange?: (hidden?: boolean) => void;
  onHiddenBeforeChange?: (hidden: boolean) => boolean;
  onVisibleChange?: (visible?: boolean) => void;
  onOverlayClick?: (e) => void;
  hidden?: boolean;
  visible?: boolean;
  defaultHidden?: boolean;
  defaultVisible?: boolean;
  disabled?: boolean;
  align?: Record<string, any>;
  getPopupContainer?: (triggerNode: Element) => HTMLElement;
  suffixCls?: string;
  prefixCls?: string;
  className?: string;
  transitionName?: string;
  placement?: Placements;
  forceRender?: boolean;
  popupClassName?: string;
  children?: ReactNode;
}

interface DropdownInterface extends FunctionComponent<DropDownProps> {
  Button: typeof DropdownButton;
}

const Dropdown: DropdownInterface = function Dropdown(props) {
  const { getProPrefixCls } = useContext(ConfigContext);
  const {
    onOverlayClick, hidden: propsHidden, visible: propsVisible, trigger, overlay, children, placement, popupClassName, disabled,
    getPopupContainer, onHiddenBeforeChange, suffixCls, prefixCls: customizePrefixCls, onHiddenChange, onVisibleChange,
  } = props;
  const prefixCls = getProPrefixCls(suffixCls!, customizePrefixCls);
  const [hidden, setHidden] = useState<boolean>(() => {
    if ('hidden' in props) {
      return props.hidden!;
    }
    if ('visible' in props) {
      return !props.visible!;
    }
    if ('defaultHidden' in props) {
      return props.defaultHidden!;
    }
    return !props.defaultVisible;
  });
  const renderedContentPropsRef = useRef<{ onClick?(e) }>();
  const getContent = useCallback((...popupProps): ReactNode => {
    if (typeof overlay === 'function') {
      return overlay(...popupProps);
    }
    return overlay;
  }, [overlay]);
  const handleClick = useCallback((e) => {
    if (onOverlayClick) {
      onOverlayClick(e);
    }
    const { onClick } = renderedContentPropsRef.current || {};
    if (onClick) {
      onClick(e);
    }
    if (propsHidden === undefined && propsVisible === undefined) {
      setHidden(true);
    }
  }, [onOverlayClick, propsHidden, propsVisible]);
  const handlePopupHiddenChange = useCallback((hidden) => {
    if (propsHidden === undefined && propsVisible === undefined) {
      setHidden(hidden);
    }
    if (onHiddenChange) {
      onHiddenChange(hidden);
    }
    if (onVisibleChange) {
      onVisibleChange(!hidden);
    }
  }, [propsHidden, propsVisible, onHiddenChange, onVisibleChange]);
  const renderPopupContent = useCallback((...popupProps) => {
    const content = getContent(...popupProps);
    if (isValidElement<any>(content)) {
      renderedContentPropsRef.current = content.props;
      return cloneElement<any>(content, {
        onClick: handleClick,
      });
    }
  }, [getContent]);

  useEffect(() => {
    if (propsHidden !== undefined) {
      setHidden(propsHidden);
    } else if (propsVisible !== undefined) {
      setHidden(!propsVisible);
    }
  }, [propsHidden, propsVisible]);

  const triggerActions = disabled ? [] : trigger;

  return (
    <Trigger
      prefixCls={prefixCls}
      action={triggerActions}
      builtinPlacements={builtinPlacements}
      popupPlacement={placement}
      popupContent={renderPopupContent}
      popupStyle={popupStyle}
      popupClassName={popupClassName}
      onPopupHiddenChange={handlePopupHiddenChange}
      onPopupHiddenBeforeChange={onHiddenBeforeChange}
      popupHidden={hidden}
      getPopupContainer={getPopupContainer}
    >
      {children}
    </Trigger>
  );
};

Dropdown.displayName = 'Dropdown';
Dropdown.Button = DropdownButton;

Dropdown.defaultProps = {
  suffixCls: 'dropdown',
  placement: Placements.bottomLeft,
  trigger: [Action.hover, Action.focus],
  defaultHidden: true,
};

export default Dropdown;
