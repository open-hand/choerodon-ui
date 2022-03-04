import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Align from '../../align';
import Animate from '../../animate';
import PopupInner from './PopupInner';
import LazyRenderBox from './LazyRenderBox';
import { saveRef } from './utils';

class Popup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      // Used for stretch
      stretchChecked: false,
      targetWidth: undefined,
      targetHeight: undefined,
    };

    this.savePopupRef = saveRef.bind(this, 'popupInstance');
    this.saveAlignRef = saveRef.bind(this, 'alignInstance');
  }

  componentDidMount() {
    this.rootNode = this.getPopupDomNode();
    this.setStretchSize();
  }

  componentDidUpdate() {
    this.setStretchSize();
  }

  onAlign = (popupDomNode, align) => {
    const props = this.props;
    const currentAlignClassName = props.getClassNameFromAlign(align);
    // FIX: https://github.com/react-component/trigger/issues/56
    // FIX: https://github.com/react-component/tooltip/issues/79
    if (this.currentAlignClassName !== currentAlignClassName) {
      this.currentAlignClassName = currentAlignClassName;
      popupDomNode.className = this.getClassName(currentAlignClassName);
    }
    props.onAlign(popupDomNode, align);
  };

  // Record size if stretch needed
  setStretchSize = () => {
    const { stretch, getRootDomNode, visible } = this.props;
    const { stretchChecked, targetHeight, targetWidth } = this.state;

    if (!stretch || !visible) {
      if (stretchChecked) {
        this.setState({ stretchChecked: false });
      }
      return;
    }

    const $ele = getRootDomNode();
    if (!$ele) return;

    const height = $ele.offsetHeight;
    const width = $ele.offsetWidth;

    if (targetHeight !== height || targetWidth !== width || !stretchChecked) {
      this.setState({
        stretchChecked: true,
        targetHeight: height,
        targetWidth: width,
      });
    }
  };

  getPopupDomNode() {
    return ReactDOM.findDOMNode(this.popupInstance);
  }

  getTargetElement = () => {
    return this.props.getRootDomNode();
  };

  // `target` on `rc-align` can accept as a function to get the bind element or a point.
  // ref: https://www.npmjs.com/package/rc-align
  getAlignTarget = () => {
    const { point } = this.props;
    if (point) {
      return point;
    }
    return this.getTargetElement;
  };

  getMaskTransitionName() {
    const props = this.props;
    let transitionName = props.maskTransitionName;
    const animation = props.maskAnimation;
    if (!transitionName && animation) {
      transitionName = `${props.prefixCls}-${animation}`;
    }
    return transitionName;
  }

  getTransitionName() {
    const props = this.props;
    let transitionName = props.transitionName;
    if (!transitionName && props.animation) {
      transitionName = `${props.prefixCls}-${props.animation}`;
    }
    return transitionName;
  }

  getClassName(currentAlignClassName) {
    return `${this.props.prefixCls} ${this.props.className} ${currentAlignClassName}`;
  }

  renderPopupInner = (innerRef) => {
    const { savePopupRef } = this;
    const { stretchChecked, targetHeight, targetWidth } = this.state;
    const {
      align,
      prefixCls, style, getClassNameFromAlign,
      destroyPopupOnHide, stretch, children,
      onMouseEnter, onMouseLeave,
    } = this.props;
    const className = this.getClassName(this.currentAlignClassName ||
      getClassNameFromAlign(align));
    const hiddenClassName = `${prefixCls}-hidden`;
    const sizeStyle = {};
    if (stretch) {
      if (stretchChecked) {
        // Stretch with target
        if (stretch.indexOf('height') !== -1) {
          sizeStyle.height = targetHeight;
        } else if (stretch.indexOf('minHeight') !== -1) {
          sizeStyle.minHeight = targetHeight;
        }
        if (stretch.indexOf('width') !== -1) {
          sizeStyle.width = targetWidth;
        } else if (stretch.indexOf('minWidth') !== -1) {
          sizeStyle.minWidth = targetWidth;
        }
      } else {
        sizeStyle.visibility = 'hidden';
        setTimeout(() => {
          if (this.alignInstance) {
            this.alignInstance.forceAlign();
          }
        }, 0);
      }
    }
    const newStyle = {
      ...sizeStyle,
      ...style,
      ...this.getZIndexStyle(),
    };
    const popupInnerProps = {
      className,
      prefixCls,
      ref: savePopupRef,
      onMouseEnter,
      onMouseLeave,
      style: newStyle,
    };
    if (!destroyPopupOnHide) {
      popupInnerProps.hiddenClassName = hiddenClassName;
    }
    return (
      <PopupInner
        innerRef={innerRef}
        {...popupInnerProps}
      >
        {children}
      </PopupInner>
    );
  };

  getPopupElement() {
    const { stretchChecked } = this.state;
    const {
      align, visible,
      destroyPopupOnHide, stretch,
    } = this.props;

    if (!visible) {
      this.currentAlignClassName = null;
    }

    if (stretch && !stretchChecked) {
      // Do nothing when stretch not ready
      return null;
    }

    if (destroyPopupOnHide) {
      return (
        <Animate
          component=""
          exclusive
          transitionAppear
          transitionName={this.getTransitionName()}
        >
          {visible ? (
            <Align
              target={this.getAlignTarget()}
              key="popup"
              ref={this.saveAlignRef}
              monitorWindowResize
              hidden={!visible}
              childrenProps={{ hidden: 'hidden' }}
              align={align}
              onAlign={this.onAlign}
            >
              {this.renderPopupInner}
            </Align>
          ) : null}
        </Animate>
      );
    }
    return (
      <Animate
        component=""
        exclusive
        transitionAppear
        transitionName={this.getTransitionName()}
        hiddenProp="hidden"
      >
        <Align
          target={this.getAlignTarget()}
          key="popup"
          ref={this.saveAlignRef}
          monitorWindowResize
          childrenProps={{ hidden: 'hidden' }}
          hidden={!visible}
          align={align}
          onAlign={this.onAlign}
        >
          {this.renderPopupInner}
        </Align>
      </Animate>
    );
  }

  getZIndexStyle() {
    const style = {};
    const props = this.props;
    if (props.zIndex !== undefined) {
      style.zIndex = props.zIndex;
    }
    return style;
  }

  getMaskElement() {
    const props = this.props;
    let maskElement;
    if (props.mask) {
      const maskTransition = this.getMaskTransitionName();
      maskElement = (
        <LazyRenderBox
          style={this.getZIndexStyle()}
          key="mask"
          className={`${props.prefixCls}-mask`}
          hiddenClassName={`${props.prefixCls}-mask-hidden`}
          hidden={!props.visible}
        />
      );
      if (maskTransition) {
        maskElement = (
          <Animate
            key="mask"
            hiddenProp="hidden"
            transitionAppear
            component=""
            transitionName={maskTransition}
          >
            {maskElement}
          </Animate>
        );
      }
    }
    return maskElement;
  }

  render() {
    return (
      <div>
        {this.getMaskElement()}
        {this.getPopupElement()}
      </div>
    );
  }
}

export default Popup;
