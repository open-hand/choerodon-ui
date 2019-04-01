import React, { Children, Component, CSSProperties, MouseEventHandler, ReactNode } from 'react';
import classNames from 'classnames';
import omit from 'lodash/omit';
import { Size } from '../_util/enum';
import Grid from './Grid';
import Meta from './Meta';
import Tabs from '../tabs';
import { throttleByAnimationFrameDecorator } from '../_util/throttleByAnimationFrame';
import warning from '../_util/warning';
import addEventListener from '../_util/addEventListener';
import { getPrefixCls } from '../configure';

export { CardGridProps } from './Grid';
export { CardMetaProps } from './Meta';

export type CardType = 'inner';

export interface CardTabListType {
  key: string;
  tab: ReactNode;
}

export interface CardProps {
  prefixCls?: string;
  title?: ReactNode;
  extra?: ReactNode;
  bordered?: boolean;
  bodyStyle?: CSSProperties;
  style?: CSSProperties;
  loading?: boolean;
  noHovering?: boolean;
  hoverable?: boolean;
  children?: ReactNode;
  id?: string;
  className?: string;
  type?: CardType;
  cover?: ReactNode;
  actions?: ReactNode[];
  tabList?: CardTabListType[];
  onTabChange?: (key: string) => void;
  onHeadClick?: MouseEventHandler<any>;
  activeTabKey?: string;
  defaultActiveTabKey?: string;
}

export default class Card extends Component<CardProps, {}> {
  static displayName = 'Card';
  static Grid: typeof Grid = Grid;
  static Meta: typeof Meta = Meta;
  resizeEvent: any;
  updateWiderPaddingCalled: boolean;
  state = {
    widerPadding: false,
  };
  private container: HTMLDivElement;

  componentDidMount() {
    this.updateWiderPadding();
    this.resizeEvent = addEventListener(window, 'resize', this.updateWiderPadding);

    if ('noHovering' in this.props) {
      warning(
        !this.props.noHovering,
        '`noHovering` of Card is deperated, you can remove it safely or use `hoverable` instead.',
      );
      warning(!!this.props.noHovering, '`noHovering={false}` of Card is deperated, use `hoverable` instead.');
    }
  }

  componentWillUnmount() {
    if (this.resizeEvent) {
      this.resizeEvent.remove();
    }
    (this.updateWiderPadding as any).cancel();
  }

  @throttleByAnimationFrameDecorator()
  updateWiderPadding() {
    if (!this.container) {
      return;
    }
    // 936 is a magic card width pixer number indicated by designer
    const WIDTH_BOUDARY_PX = 936;
    if (this.container.offsetWidth >= WIDTH_BOUDARY_PX && !this.state.widerPadding) {
      this.setState({ widerPadding: true }, () => {
        this.updateWiderPaddingCalled = true; // first render without css transition
      });
    }
    if (this.container.offsetWidth < WIDTH_BOUDARY_PX && this.state.widerPadding) {
      this.setState({ widerPadding: false }, () => {
        this.updateWiderPaddingCalled = true; // first render without css transition
      });
    }
  }

  onTabChange = (key: string) => {
    if (this.props.onTabChange) {
      this.props.onTabChange(key);
    }
  };
  saveRef = (node: HTMLDivElement) => {
    this.container = node;
  };

  isContainGrid() {
    let containGrid;
    Children.forEach(this.props.children, (element: JSX.Element) => {
      if (element && element.type && element.type === Grid) {
        containGrid = true;
      }
    });
    return containGrid;
  }

  getAction(actions: ReactNode[]) {
    if (!actions || !actions.length) {
      return null;
    }
    const actionList = actions.map((action, index) => (
        <li style={{ width: `${100 / actions.length}%` }} key={`action-${index}`}>
          <span>{action}</span>
        </li>
      ),
    );
    return actionList;
  }

  // For 2.x compatible
  getCompatibleHoverable() {
    const { noHovering, hoverable } = this.props;
    if ('noHovering' in this.props) {
      return !noHovering || hoverable;
    }
    return !!hoverable;
  }

  render() {
    const {
      prefixCls: customizePrefixCls, className, extra, bodyStyle, noHovering, hoverable, title, loading,
      bordered = true, type, cover, actions, tabList, children, activeTabKey, defaultActiveTabKey, onHeadClick, ...others,
    } = this.props;
    const prefixCls = getPrefixCls('card', customizePrefixCls);

    const classString = classNames(prefixCls, className, {
      [`${prefixCls}-loading`]: loading,
      [`${prefixCls}-bordered`]: bordered,
      [`${prefixCls}-hoverable`]: this.getCompatibleHoverable(),
      [`${prefixCls}-wider-padding`]: this.state.widerPadding,
      [`${prefixCls}-padding-transition`]: this.updateWiderPaddingCalled,
      [`${prefixCls}-contain-grid`]: this.isContainGrid(),
      [`${prefixCls}-contain-tabs`]: tabList && tabList.length,
      [`${prefixCls}-type-${type}`]: !!type,
    });

    const loadingBlock = (
      <div className={`${prefixCls}-loading-content`}>
        <p className={`${prefixCls}-loading-block`} style={{ width: '94%' }} />
        <p>
          <span className={`${prefixCls}-loading-block`} style={{ width: '28%' }} />
          <span className={`${prefixCls}-loading-block`} style={{ width: '62%' }} />
        </p>
        <p>
          <span className={`${prefixCls}-loading-block`} style={{ width: '22%' }} />
          <span className={`${prefixCls}-loading-block`} style={{ width: '66%' }} />
        </p>
        <p>
          <span className={`${prefixCls}-loading-block`} style={{ width: '56%' }} />
          <span className={`${prefixCls}-loading-block`} style={{ width: '39%' }} />
        </p>
        <p>
          <span className={`${prefixCls}-loading-block`} style={{ width: '21%' }} />
          <span className={`${prefixCls}-loading-block`} style={{ width: '15%' }} />
          <span className={`${prefixCls}-loading-block`} style={{ width: '40%' }} />
        </p>
      </div>
    );

    const hasActiveTabKey = activeTabKey !== undefined;
    const extraProps = {
      [hasActiveTabKey ? 'activeKey' : 'defaultActiveKey']: hasActiveTabKey
        ? activeTabKey
        : defaultActiveTabKey,
    };

    let head;
    const tabs = tabList && tabList.length ? (
      <Tabs
        {...extraProps}
        className={`${prefixCls}-head-tabs`}
        size={Size.large}
        onChange={this.onTabChange}
      >
        {tabList.map(item => <Tabs.TabPane tab={item.tab} key={item.key} />)}
      </Tabs>
    ) : null;
    if (title || extra || tabs) {
      head = (
        <div className={`${prefixCls}-head`} onClick={onHeadClick}>
          <div className={`${prefixCls}-head-wrapper`}>
            {title && <div className={`${prefixCls}-head-title`}>{title}</div>}
            {extra && <div className={`${prefixCls}-extra`}>{extra}</div>}
          </div>
          {tabs}
        </div>
      );
    }
    const coverDom = cover ? <div className={`${prefixCls}-cover`}>{cover}</div> : null;
    const body = (
      <div className={`${prefixCls}-body`} style={bodyStyle}>
        {loading ? loadingBlock : children}
      </div>
    );
    const actionDom = actions && actions.length ?
      <ul className={`${prefixCls}-actions`}>{this.getAction(actions)}</ul> : null;
    const divProps = omit(others, [
      'onTabChange',
    ]);
    return (
      <div {...divProps} className={classString} ref={this.saveRef}>
        {head}
        {coverDom}
        {body}
        {actionDom}
      </div>
    );
  }
}
