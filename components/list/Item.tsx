import React, { Children, CSSProperties, FunctionComponent, memo, ReactElement, ReactNode, useContext } from 'react';
import classNames from 'classnames';
import { Col } from '../grid';
import { ColumnType, ListGridType } from './index';
import ConfigContext from '../config-provider/ConfigContext';
import ListContext from './ListContext';

export interface ListItemProps {
  className?: string;
  children?: ReactNode;
  prefixCls?: string;
  style?: CSSProperties;
  extra?: ReactNode;
  actions?: Array<ReactNode>;
  grid?: ListGridType;
  renderCheckBox?: { element:() => HTMLElement, isChecked: boolean };
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

const ListMeta: FunctionComponent<ListItemMetaProps> = function ListMeta(props) {
  const { prefixCls: customizePrefixCls, className, avatar, title, description, ...others } = props;
  const { getPrefixCls } = useContext(ConfigContext);
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

ListMeta.displayName = 'ListMeta';

export const Meta = memo(ListMeta);

function getGrid(grid: ListGridType, t: ColumnType) {
  return grid[t] && Math.floor(24 / grid[t]!);
}

const ListItem: FunctionComponent<ListItemProps> = function ListItem(props) {
  const { grid, getPrefixCls } = useContext(ListContext);
  const {
    prefixCls: customizePrefixCls,
    children,
    actions,
    extra,
    className,
    renderCheckBox,
    ...others
  } = props;
  const prefixCls = getPrefixCls('list', customizePrefixCls);
  const classString = classNames(`${prefixCls}-item`, className, {
    [`${prefixCls}-selection`]: renderCheckBox,
    [`${prefixCls}-selected`]: renderCheckBox && renderCheckBox.isChecked,
  });

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
    [`${prefixCls}-item-content-single`]: metaContent.length < 1,
  });
  const content =
    otherContent.length > 0 ? <div className={contentClassString}>{otherContent}</div> : null;

  let actionsContent;
  if (actions && actions.length > 0) {
    const actionsContentItem = (action: ReactNode, i: number) => (
      <li key={`${prefixCls}-item-action-${i}`}>
        {action}
        {i !== actions.length - 1 && <em className={`${prefixCls}-item-action-split`} />}
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
      {renderCheckBox && renderCheckBox.element()}
      <>
        {extra && extraContent}
        {!extra && metaContent}
        {!extra && content}
        {!extra && actionsContent}
      </>
    </div>
  );

  return mainContent;
};


ListItem.displayName = 'ListItem';

export type ListItemComponent = typeof ListItem & { Meta: typeof Meta };

(ListItem as ListItemComponent).Meta = Meta;

export default ListItem as ListItemComponent;
