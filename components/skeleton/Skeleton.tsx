import * as React from 'react';
import classNames from 'classnames';
import Title, { SkeletonTitleProps } from './Title';
import Grid, { SkeletonGridProps } from './Grid';
import Paragraph, { SkeletonParagraphProps } from './Paragraph';
import SkeletonButton from './Button';
import Element from './Element';
import SkeletonAvatar, { AvatarProps } from './Avatar';
import SkeletonInput from './Input';
import ConfigContext, { ConfigContextValue } from '../config-provider/ConfigContext';

/* This only for skeleton internal. */
type SkeletonAvatarProps = Omit<AvatarProps, 'active'>

export interface SkeletonProps {
  active?: boolean;
  loading?: boolean;
  prefixCls?: string;
  className?: string;
  children?: React.ReactNode;
  avatar?: SkeletonAvatarProps | boolean;
  title?: SkeletonTitleProps | boolean;
  paragraph?: SkeletonParagraphProps | boolean;
  grid?: SkeletonGridProps;
}

function getComponentProps<T>(prop: T | boolean | undefined): T | {} {
  if (prop && typeof prop === 'object') {
    return prop;
  }
  return {};
}

function getAvatarBasicProps(hasTitle: boolean, hasParagraph: boolean): SkeletonAvatarProps {
  if (hasTitle && !hasParagraph) {
    // Square avatar
    return { size: 'large', shape: 'square' };
  }

  return { size: 'large', shape: 'circle' };
}

function getTitleBasicProps(hasAvatar: boolean, hasParagraph: boolean): SkeletonTitleProps {
  if (!hasAvatar && hasParagraph) {
    return { width: '38%' };
  }

  if (hasAvatar && hasParagraph) {
    return { width: '50%' };
  }

  return {};
}

function getParagraphBasicProps(hasAvatar: boolean, hasTitle: boolean): SkeletonParagraphProps {
  const basicProps: SkeletonParagraphProps = {};

  // Width
  if (!hasAvatar || !hasTitle) {
    basicProps.width = '61%';
  }

  // Rows
  if (!hasAvatar && hasTitle) {
    basicProps.rows = 3;
  } else {
    basicProps.rows = 2;
  }

  return basicProps;
}

class Skeleton extends React.Component<SkeletonProps, any> {
  static get contextType(): typeof ConfigContext {
    return ConfigContext;
  }

  static Button: typeof SkeletonButton;

  static Avatar: typeof SkeletonAvatar;

  static Input: typeof SkeletonInput;

  static defaultProps: Partial<SkeletonProps> = {
    avatar: false,
    title: true,
    paragraph: true,
  };

  context: ConfigContextValue;

  renderSkeleton = () => {
    const {
      prefixCls: customizePrefixCls,
      loading,
      className,
      children,
      avatar,
      title,
      paragraph,
      active,
      grid,
    } = this.props;
    const { getPrefixCls } = this.context;

    const prefixCls = getPrefixCls('skeleton', customizePrefixCls);

    if (loading || !('loading' in this.props)) {
      const hasAvatar = !!avatar;
      const hasTitle = !!title;
      const hasParagraph = !!paragraph;
      const hasGrid = !!grid;

      // Avatar
      let avatarNode;
      if (hasAvatar) {
        const avatarProps: SkeletonAvatarProps = {
          prefixCls: `${prefixCls}-avatar`,
          ...getAvatarBasicProps(hasTitle, hasParagraph),
          ...getComponentProps(avatar),
        };
        // We direct use SkeletonElement as avatar in skeleton internal.
        avatarNode = (
          <div className={`${prefixCls}-header`}>
            <Element {...avatarProps} />
          </div>
        );
      }

      let contentNode;
      if (hasTitle || hasParagraph || hasGrid) {
        // Title
        let $title;
        if (hasTitle) {
          const titleProps: SkeletonTitleProps = {
            prefixCls: `${prefixCls}-title`,
            ...getTitleBasicProps(hasAvatar, hasParagraph || hasGrid),
            ...getComponentProps(title),
          };

          $title = <Title {...titleProps} />;
        }

        // Paragraph
        let paragraphNode;
        if (hasParagraph) {
          const paragraphProps: SkeletonParagraphProps = {
            prefixCls: `${prefixCls}-paragraph`,
            ...getParagraphBasicProps(hasAvatar, hasTitle),
            ...getComponentProps(paragraph),
          };

          paragraphNode = <Paragraph {...paragraphProps} />;
        }

        // Grid
        let gridNode;
        if (hasGrid) {
          const gridProps: SkeletonGridProps = {
            prefixCls: `${prefixCls}-grid`,
            ...getComponentProps(grid),
          };

          gridNode = <Grid {...gridProps} />;
        }

        contentNode = (
          <div className={`${prefixCls}-content`}>
            {$title}
            {paragraphNode}
            {gridNode}
          </div>
        );
      }

      const cls = classNames(prefixCls, className, {
        [`${prefixCls}-with-avatar`]: hasAvatar,
        [`${prefixCls}-active`]: active,
        [`${prefixCls}-rtl`]:false,
      });

      return (
        <div className={cls}>
          {avatarNode}
          {contentNode}
        </div>
      );
    }

    return children;
  };

  render() {
    return <>{this.renderSkeleton()}</>;
  }
}

export default Skeleton;
