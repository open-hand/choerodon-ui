import React, { CSSProperties, ReactNode } from 'react';
import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types';
import omit from 'lodash/omit';
import noop from 'lodash/noop';
import { action, observable, runInAction } from 'mobx';
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
}

export default abstract class TriggerField<T extends TriggerFieldProps> extends TextField<T & TriggerFieldProps> {
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
    ...TextField.propTypes,
  };

  static defaultProps = {
    ...TextField.defaultProps,
    suffixCls: 'pro-trigger',
    clearButton: true,
    trigger: ['focus', 'click'],
    triggerShowDelay: 150,
    triggerHiddenDelay: 50,
  };

  popupTask: TaskRunner = new TaskRunner();
  trigger: Trigger | null;
  @observable popup: boolean;

  constructor(props, context) {
    super(props, context);
    runInAction(() => {
      this.popup = false;
    });
  }

  abstract getTriggerIconFont(): string;

  abstract handlePopupAnimateAppear(key);

  abstract handlePopupAnimateEnd(key, exists);

  abstract getPopupStyleFromAlign(target): CSSProperties | undefined;

  abstract getPopupContent();

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
    ]);
  }

  getPopupProps() {
    return {};
  }

  getWrappedEditor() {
    const {
      prefixCls, props: {
        popupCls, popupStyle, popupContent, hidden, trigger, triggerShowDelay, triggerHiddenDelay,
      },
    } = this;
    let content;
    if (popupContent !== void 0) {
      if (typeof popupContent === 'function') {
        content = popupContent(this.getPopupProps());
      } else {
        content = popupContent;
      }
    } else {
      content = this.getPopupContent();
    }
    return (
      <Trigger
        ref={node => this.trigger = node}
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
    return (
      <Icon
        type={this.getTriggerIconFont()}
        className={`${prefixCls}-trigger`}
      />
    );
  }

  @autobind
  handlePopupMouseDown(e) {
    e.preventDefault();
    const { onMouseDown = noop } = this.props;
    onMouseDown(e);
  }

  @autobind
  handlePopupHiddenChange(hidden: boolean) {
    runInAction(() => {
      this.popup = !hidden;
    });
  }

  forcePopupAlign() {
    if (this.trigger) {
      this.trigger.forcePopupAlign();
    }
  }

  expand() {
    this.popupTask.cancel();
    if (!this.isReadOnly() && !this.popup) {
      this.popupTask.delay(this.props.triggerShowDelay as number, action(() => {
        this.popup = true;
      }));
    }
  }

  collapse() {
    this.popupTask.cancel();
    if (!this.isReadOnly() && this.popup) {
      this.popupTask.delay(this.props.triggerHiddenDelay as number, action(() => {
        this.popup = false;
      }));
    }
  }
}
