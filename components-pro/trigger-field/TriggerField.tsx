import React, { CSSProperties, ReactNode } from 'react';
import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types';
import omit from 'lodash/omit';
import noop from 'lodash/noop';
import { action, computed, observable } from 'mobx';
import { PropTypes as MobxPropTypes } from 'mobx-react';
import Trigger from '../trigger/Trigger';
import { Action } from '../trigger/enum';
import { TextField, TextFieldProps } from '../text-field/TextField';
import autobind from '../_util/autobind';
import Icon from '../icon';
import TaskRunner from '../_util/TaskRunner';

const BUILT_IN_PLACEMENTS = {
  bottomLeft: {
    points: ['tl', 'bl'],
    offset: [0, 4],
    overflow: {
      adjustX: 1,
      adjustY: 1,
    },
  },
  bottomRight: {
    points: ['tr', 'br'],
    offset: [0, 4],
    overflow: {
      adjustX: 1,
      adjustY: 1,
    },
  },
  topLeft: {
    points: ['bl', 'tl'],
    offset: [0, -4],
    overflow: {
      adjustX: 1,
      adjustY: 1,
    },
  },
  topRight: {
    points: ['br', 'tr'],
    offset: [0, -4],
    overflow: {
      adjustX: 1,
      adjustY: 1,
    },
  },
};

export interface TriggerFieldProps extends TextFieldProps {
  /**
   * 下拉框的自定义内容
   */
  popupContent?: ReactNode | ((props: any) => ReactNode);
  /**
   * 下拉框的自定义样式名
   */
  popupCls?: string;
  /**
   * 下拉框的内链样式
   */
  popupStyle?: CSSProperties;
  /**
   * 触发下拉框的方式组
   * 可选值：click | focus | hover | contextMenu
   */
  trigger?: Action[];
  /**
   * 下拉框显示延迟
   * @defualt 150
   */
  triggerShowDelay?: number;
  /**
   * 下拉框隐藏延迟
   * @defualt 50
   */
  triggerHiddenDelay?: number;
  /**
   * 下拉框变化钩子
   */
  onPopupHiddenChange?: (hidden: boolean) => void;
  /**
   * 定义浮层的容器，默认为 body
   * @param triggerNode
   */
  getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement;
}

export default abstract class TriggerField<T extends TriggerFieldProps> extends TextField<
  T & TriggerFieldProps
> {
  static displayName = 'TriggerField';

  static propTypes = {
    /**
     * 下拉框的自定义内容
     */
    popupContent: PropTypes.element,
    /**
     * 下拉框的自定义样式名
     */
    popupCls: PropTypes.string,
    /**
     * 下拉框的内链样式
     */
    popupStyle: PropTypes.object,
    /**
     * 触发下拉框的方式
     * 可选值：click | focus | hover | contextMenu
     */
    trigger: MobxPropTypes.arrayOrObservableArrayOf(PropTypes.string),
    /**
     * 下拉框显示延迟
     * @defualt 150
     */
    triggerShowDelay: PropTypes.number,
    /**
     * 下拉框隐藏延迟
     * @defualt 50
     */
    triggerHiddenDelay: PropTypes.number,
    /**
     * 下拉框变化钩子
     */
    onPopupHiddenChange: PropTypes.func,
    /**
     * 定义浮层的容器，默认为 body
     */
    getPopupContainer: PropTypes.func,
    ...TextField.propTypes,
  };

  static defaultProps = {
    ...TextField.defaultProps,
    suffixCls: 'trigger',
    clearButton: true,
    trigger: ['focus', 'click'],
    triggerShowDelay: 150,
    triggerHiddenDelay: 50,
  };

  popupTask: TaskRunner = new TaskRunner();

  trigger: Trigger | null;

  @observable statePopup: boolean;

  @computed
  get popup(): boolean {
    return this.statePopup;
  }

  constructor(props, context) {
    super(props, context);
    this.setPopup(false);
  }

  isValidationMessageHidden(message?: ReactNode): undefined | boolean {
    return super.isValidationMessageHidden(message) || this.popup;
  }

  @action
  setPopup(statePopup: boolean) {
    this.statePopup = statePopup;
  }

  abstract getTriggerIconFont(): string;

  abstract handlePopupAnimateAppear(key): void;

  abstract handlePopupAnimateEnd(key, exists): void;

  abstract getPopupStyleFromAlign(target): CSSProperties | undefined;

  abstract getPopupContent(): ReactNode;

  @autobind
  getRootDomNode() {
    return findDOMNode(this);
  }

  getOtherProps() {
    return omit(super.getOtherProps(), [
      'popupContent',
      'popupCls',
      'editable',
      'trigger',
      'triggerShowDelay',
      'triggerHiddenDelay',
      'onPopupHiddenChange',
      'getPopupContainer',
      'extraFooterPlacement',
      'renderExtraFooter',
      'treeDefaultExpandedKeys',
      'treeDefaultExpandAll',
    ]);
  }

  getPopupProps() {
    return {};
  }

  getWrappedEditor() {
    const {
      prefixCls,
      props: {
        popupCls,
        popupStyle,
        popupContent,
        hidden,
        trigger,
        triggerShowDelay,
        triggerHiddenDelay,
        getPopupContainer,
      },
    } = this;
    let content;
    if (popupContent !== undefined) {
      if (popupContent instanceof Function) {
        content = popupContent(this.getPopupProps());
      } else {
        content = popupContent;
      }
    } else {
      content = this.getPopupContent();
    }
    return (
      <Trigger
        ref={node => (this.trigger = node)}
        action={this.isReadOnly() || this.isDisabled() ? [] : trigger}
        focusDelay={triggerShowDelay}
        blurDelay={triggerHiddenDelay}
        mouseEnterDelay={triggerShowDelay}
        mouseLeaveDelay={triggerHiddenDelay}
        prefixCls={prefixCls}
        popupCls={popupCls}
        popupStyle={popupStyle}
        popupContent={content}
        popupPlacement="bottomLeft"
        popupHidden={hidden || !this.popup}
        builtinPlacements={BUILT_IN_PLACEMENTS}
        onPopupAnimateAppear={this.handlePopupAnimateAppear}
        onPopupAnimateEnd={this.handlePopupAnimateEnd}
        onPopupHiddenChange={this.handlePopupHiddenChange}
        getPopupStyleFromAlign={this.getPopupStyleFromAlign}
        getRootDomNode={this.getRootDomNode}
        getPopupContainer={getPopupContainer}
      >
        {this.getEditor()}
      </Trigger>
    );
  }

  getWrapperClassNames(...args): string {
    const { prefixCls } = this;
    return super.getWrapperClassNames(...args, {
      [`${prefixCls}-expand`]: this.popup,
      [`${prefixCls}-not-editable`]: !this.isDisabled() && !this.editable,
    });
  }

  getDefaultSuffix(): ReactNode {
    const { prefixCls } = this;
    return <Icon type={this.getTriggerIconFont()} className={`${prefixCls}-trigger`} />;
  }

  @autobind
  handleTagAnimateEnd() {
    this.forcePopupAlign();
  }

  @autobind
  handlePopupMouseDown(e) {
    e.preventDefault();
    const { onMouseDown = noop } = this.props;
    onMouseDown(e);
  }

  @autobind
  handlePopupHiddenChange(hidden: boolean) {
    this.setPopup(!hidden);
    const { onPopupHiddenChange = noop } = this.props;
    onPopupHiddenChange(hidden);
  }

  forcePopupAlign() {
    if (this.trigger) {
      this.trigger.forcePopupAlign();
    }
  }

  expand() {
    this.popupTask.cancel();
    if (!this.isReadOnly() && !this.popup) {
      this.popupTask.delay(this.props.triggerShowDelay as number, () => {
        this.setPopup(true);
      });
    }
  }

  collapse() {
    this.popupTask.cancel();
    if (!this.isReadOnly() && this.popup) {
      this.popupTask.delay(this.props.triggerHiddenDelay as number, () => {
        this.setPopup(false);
      });
    }
  }
}
