import React, { cloneElement, Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import Trigger from '../trigger';
import placements from './placements';

export default class Dropdown extends Component {
  static propTypes = {
    minOverlayWidthMatchTrigger: PropTypes.bool,
    onVisibleChange: PropTypes.func,
    onOverlayClick: PropTypes.func,
    prefixCls: PropTypes.string,
    children: PropTypes.any,
    transitionName: PropTypes.string,
    overlayClassName: PropTypes.string,
    animation: PropTypes.any,
    align: PropTypes.object,
    overlayStyle: PropTypes.object,
    placement: PropTypes.string,
    overlay: PropTypes.node,
    trigger: PropTypes.array,
    showAction: PropTypes.array,
    hideAction: PropTypes.array,
    getPopupContainer: PropTypes.func,
    visible: PropTypes.bool,
    defaultVisible: PropTypes.bool,
  };

  static defaultProps = {
    minOverlayWidthMatchTrigger: true,
    prefixCls: 'rc-dropdown',
    trigger: ['hover'],
    showAction: [],
    hideAction: [],
    overlayClassName: '',
    overlayStyle: {},
    defaultVisible: false,
    onVisibleChange() {},
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
    const overlayProps = props.overlay.props;
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
  };

  getMenuElement() {
    const { overlay, prefixCls } = this.props;
    const extraOverlayProps = {
      prefixCls: `${prefixCls}-menu`,
      onClick: this.onClick,
    };
    if (typeof overlay.type === 'string') {
      delete extraOverlayProps.prefixCls;
    }
    return cloneElement(overlay, extraOverlayProps);
  }

  getPopupDomNode() {
    return this.trigger.getPopupDomNode();
  }

  afterVisibleChange = visible => {
    if (visible && this.props.minOverlayWidthMatchTrigger) {
      const overlayNode = this.getPopupDomNode();
      const rootNode = ReactDOM.findDOMNode(this);
      if (rootNode && overlayNode && rootNode.offsetWidth > overlayNode.offsetWidth) {
        overlayNode.style.minWidth = `${rootNode.offsetWidth}px`;
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
      overlayStyle,
      trigger,
      ...otherProps
    } = this.props;
    return (
      <Trigger
        {...otherProps}
        prefixCls={prefixCls}
        ref={this.saveTrigger}
        popupClassName={overlayClassName}
        popupStyle={overlayStyle}
        builtinPlacements={placements}
        action={trigger}
        showAction={showAction}
        hideAction={hideAction}
        popupPlacement={placement}
        popupAlign={align}
        popupTransitionName={transitionName}
        popupAnimation={animation}
        popupVisible={this.state.visible}
        afterPopupVisibleChange={this.afterVisibleChange}
        popup={this.getMenuElement()}
        onPopupVisibleChange={this.onVisibleChange}
        getPopupContainer={getPopupContainer}
      >
        {children}
      </Trigger>
    );
  }
}
