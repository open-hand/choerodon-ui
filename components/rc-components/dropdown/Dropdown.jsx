import React, { cloneElement, Component } from 'react';
import ReactDOM from 'react-dom';
import Trigger from '../trigger';
import placements from './placements';
import { pxToRem } from '../../_util/UnitConvertor';

export default class Dropdown extends Component {
  static defaultProps = {
    prefixCls: 'rc-dropdown',
    trigger: ['hover'],
    showAction: [],
    hideAction: [],
    overlayClassName: '',
    overlayStyle: {},
    defaultVisible: false,
    onVisibleChange() {
    },
    placement: 'bottomLeft',
  };

  constructor(props) {
    super(props);
    if ('visible' in props) {
      this.state = {
        visible: props.visible,
      };
    } else {
      this.state = {
        visible: props.defaultVisible,
      };
    }
  }

  componentWillReceiveProps({ visible }) {
    if (visible !== undefined) {
      this.setState({
        visible,
      });
    }
  }

  onClick = e => {
    const props = this.props;
    const { overlay } = props;
    const element = typeof overlay === 'function' ? overlay() : overlay;
    const overlayProps = element.props;
    // do no call onVisibleChange, if you need click to hide, use onClick and control visible
    if (!('visible' in props)) {
      this.setState({
        visible: false,
      });
    }
    if (props.onOverlayClick) {
      props.onOverlayClick(e);
    }
    if (overlayProps.onClick) {
      overlayProps.onClick(e);
    }
  };

  onVisibleChange = visible => {
    const props = this.props;
    if (!('visible' in props)) {
      this.setState({
        visible,
      });
    }
    props.onVisibleChange(visible);
  }

  static getDerivedStateFromProps(nextProps) {
    if ('visible' in nextProps) {
      return {
        visible: nextProps.visible,
      };
    }
    return null;
  }

  getMinOverlayWidthMatchTrigger = () => {
    const { minOverlayWidthMatchTrigger, alignPoint } = this.props;
    if ('minOverlayWidthMatchTrigger' in this.props) {
      return minOverlayWidthMatchTrigger;
    }

    return !alignPoint;
  };

  getMenuElement = () => {
    const { overlay, prefixCls } = this.props;
    const element = typeof overlay === 'function' ? overlay() : overlay;
    if (element) {
      const extraOverlayProps = {
        prefixCls: `${prefixCls}-menu`,
        onClick: this.onClick,
      };
      if (typeof element.type === 'string') {
        delete extraOverlayProps.prefixCls;
      }
      return cloneElement(element, extraOverlayProps);
    }
  };

  getPopupDomNode() {
    return this.trigger.getPopupDomNode();
  }

  afterVisibleChange = (visible) => {
    if (visible && this.getMinOverlayWidthMatchTrigger()) {
      const overlayNode = this.getPopupDomNode();
      const rootNode = ReactDOM.findDOMNode(this);
      if (rootNode && overlayNode && rootNode.offsetWidth > overlayNode.offsetWidth) {
        overlayNode.style.minWidth = pxToRem(rootNode.offsetWidth, true);
        if (this.trigger && this.trigger._component && this.trigger._component.alignInstance) {
          this.trigger._component.alignInstance.forceAlign();
        }
      }
    }
  };

  saveTrigger = node => {
    this.trigger = node;
  };

  render() {
    const {
      prefixCls,
      children,
      transitionName,
      animation,
      align,
      placement,
      getPopupContainer,
      showAction,
      hideAction,
      overlayClassName,
      overlayPlacements,
      overlayStyle,
      trigger,
      ...otherProps
    } = this.props;
    const builtinPlacements = overlayPlacements || placements;
    return (
      <Trigger
        {...otherProps}
        prefixCls={prefixCls}
        ref={this.saveTrigger}
        popupClassName={overlayClassName}
        popupStyle={overlayStyle}
        builtinPlacements={builtinPlacements}
        action={trigger}
        showAction={showAction}
        hideAction={hideAction}
        popupPlacement={placement}
        popupAlign={align}
        popupTransitionName={transitionName}
        popupAnimation={animation}
        popupVisible={this.state.visible}
        afterPopupVisibleChange={this.afterVisibleChange}
        popup={this.getMenuElement}
        onPopupVisibleChange={this.onVisibleChange}
        getPopupContainer={getPopupContainer}
      >
        {children}
      </Trigger>
    );
  }
}
