import React, { CSSProperties, FunctionComponent, memo, ReactNode, useContext } from 'react';
import classNames from 'classnames';
import ConfigContext from '../config-provider/ConfigContext';

export interface CardMetaProps {
  prefixCls?: string;
  style?: CSSProperties;
  className?: string;
  avatar?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
}

const CardMeta: FunctionComponent<CardMetaProps> = function CardMeta(props) {
  const { prefixCls: customizePrefixCls, className, avatar, title, description, ...others } = props;
  const { getPrefixCls } = useContext(ConfigContext);
  const prefixCls = getPrefixCls('card', customizePrefixCls);
  const classString = classNames(`${prefixCls}-meta`, className);
  const avatarDom = avatar ? <div className={`${prefixCls}-meta-avatar`}>{avatar}</div> : null;
  const titleDom = title ? <div className={`${prefixCls}-meta-title`}>{title}</div> : null;
  const descriptionDom = description ?
    <div className={`${prefixCls}-meta-description`}>{description}</div> : null;
  const MetaDetail = titleDom || descriptionDom ?
    <div className={`${prefixCls}-meta-detail`}>
      {titleDom}
      {descriptionDom}
    </div> : null;
  return (
    <div {...others} className={classString}>
      {avatarDom}
      {MetaDetail}
    </div>
  );
};

CardMeta.displayName = 'CardMeta';

export default memo(CardMeta);
