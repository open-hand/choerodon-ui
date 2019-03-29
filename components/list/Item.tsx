import React, { Children, Component, CSSProperties, ReactElement, ReactNode, SFC } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Col } from '../grid';
import { ColumnType, ListGridType } from './index';
import { getPrefixCls } from '../configure';

export interface ListItemProps {
  className?: string;
  children?: ReactNode;
  prefixCls?: string;
  style?: CSSProperties;
  extra?: ReactNode;
  actions?: Array<ReactNode>;
  grid?: ListGridType;
}

export interface ListItemMetaProps {
  avatar?: ReactNode;
  className?: string;
  children?: ReactNode;
  description?: ReactNode;
  prefixCls?: string;
  style?: CSSProperties;
  title?: ReactNode;
}

export const Meta: SFC<ListItemMetaProps> = (props) => {
  const {
    prefixCls: customizePrefixCls,
    className,
    avatar,
    title,
    description,
    ...others,
  } = props;
  const prefixCls = getPrefixCls('list', customizePrefixCls);

  const classString = classNames(`${prefixCls}-item-meta`, className);

  const content = (
    <div className={`${prefixCls}-item-meta-content`}>
      {title && <h4 className={`${prefixCls}-item-meta-title`}>{title}</h4>}
      {description && <div className={`${prefixCls}-item-meta-description`}>{description}</div>}
    </div>
  );

  return (
    <div {...others} className={classString}>
      {avatar && <div className={`${prefixCls}-item-meta-avatar`}>{avatar}</div>}
      {(title || description) && content}
    </div>
  );
};

Meta.displayName = 'ListMeta';

function getGrid(grid: ListGridType, t: ColumnType) {
  return grid[t] && Math.floor(24 / grid[t]!);
}

const GridColumns = ['', 1, 2, 3, 4, 6, 8, 12, 24];

export default class Item extends Component<ListItemProps, any> {
  static displayName = 'ListItem';
  static Meta: typeof Meta = Meta;

  static propTypes = {
    column: PropTypes.oneOf(GridColumns),
    xs: PropTypes.oneOf(GridColumns),
    sm: PropTypes.oneOf(GridColumns),
    md: PropTypes.oneOf(GridColumns),
    lg: PropTypes.oneOf(GridColumns),
    xl: PropTypes.oneOf(GridColumns),
    xxl: PropTypes.oneOf(GridColumns),
  };

  static contextTypes = {
    grid: PropTypes.any,
  };

  render() {
    const { grid } = this.context;
    const { prefixCls: customizePrefixCls, children, actions, extra, className, ...others } = this.props;
    const prefixCls = getPrefixCls('list', customizePrefixCls);
    const classString = classNames(`${prefixCls}-item`, className);

    const metaContent: ReactElement<any>[] = [];
    const otherContent: ReactElement<any>[] = [];

    Children.forEach(children, (element: ReactElement<any>) => {
      if (element && element.type && element.type === Meta) {
        metaContent.push(element);
      } else {
        otherContent.push(element);
      }
    });

    const contentClassString = classNames(`${prefixCls}-item-content`, {
      [`${prefixCls}-item-content-single`]: (metaContent.length < 1),
    });
    const content = otherContent.length > 0 ? (
      <div className={contentClassString}>
        {otherContent}
      </div>) : null;

    let actionsContent;
    if (actions && actions.length > 0) {
      const actionsContentItem = (action: ReactNode, i: number) => (
        <li key={`${prefixCls}-item-action-${i}`}>
          {action}
          {i !== (actions.length - 1) && <em className={`${prefixCls}-item-action-split`} />}
        </li>
      );
      actionsContent = (
        <ul className={`${prefixCls}-item-action`}>
          {actions.map((action, i) => actionsContentItem(action, i))}
        </ul>
      );
    }

    const extraContent = (
      <div className={`${prefixCls}-item-extra-wrap`}>
        <div className={`${prefixCls}-item-main`}>
          {metaContent}
          {content}
          {actionsContent}
        </div>
        <div className={`${prefixCls}-item-extra`}>{extra}</div>
      </div>
    );

    const mainContent = grid ? (
      <Col
        span={getGrid(grid, 'column')}
        xs={getGrid(grid, 'xs')}
        sm={getGrid(grid, 'sm')}
        md={getGrid(grid, 'md')}
        lg={getGrid(grid, 'lg')}
        xl={getGrid(grid, 'xl')}
        xxl={getGrid(grid, 'xxl')}
      >
        <div {...others} className={classString}>
          {extra && extraContent}
          {!extra && metaContent}
          {!extra && content}
          {!extra && actionsContent}
        </div>
      </Col>
    ) : (
      <div {...others} className={classString}>
        {extra && extraContent}
        {!extra && metaContent}
        {!extra && content}
        {!extra && actionsContent}
      </div>
    );

    return mainContent;
  }
}
