import React, { Children, cloneElement } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import DocumentTitle from 'react-document-title';
import { getChildren } from 'jsonml.js/lib/utils';
import { Affix, Alert, Timeline } from 'choerodon-ui';
import EditButton from './EditButton';

export default class Article extends React.Component {
  static contextTypes = {
    intl: PropTypes.object.isRequired,
  };

  getArticle(article) {
    const { content } = this.props;
    const { meta } = content;
    if (!meta.timeline) {
      return article;
    }
    const timelineItems = [];
    let temp = [];
    let i = 1;
    Children.forEach(article.props.children, (child) => {
      if (child.type === 'h2' && temp.length > 0) {
        timelineItems.push(<Timeline.Item key={i}>{temp}</Timeline.Item>);
        temp = [];
        i += 1;
      }
      temp.push(child);
    });
    if (temp.length > 0) {
      timelineItems.push(<Timeline.Item key={i}>{temp}</Timeline.Item>);
    }
    return cloneElement(article, {
      children: <Timeline>{timelineItems}</Timeline>,
    });
  }

  render() {
    const { props } = this;
    const { content } = props;

    const { meta, description } = content;
    const { title, subtitle, filename } = meta;
    const { intl: { locale } } = this.context;
    const isNotTranslated = locale === 'en-US' && typeof title === 'object';
    return (
      <DocumentTitle title={`${title[locale] || title} - Choerodon UI`}>
        <article className="markdown">
          {isNotTranslated && (
            <Alert
              type="warning"
              message={(
                <span>
                  This article has not been translated yet. Wanna help us out?&nbsp;
                </span>
              )}
            />
          )}
          <h1>
            {title[locale] || title}
            {
              !subtitle || locale === 'en-US' ? null : <span className="subtitle">{subtitle}</span>
            }
            <EditButton title={<FormattedMessage id="app.content.edit-page" />} filename={filename} />
          </h1>
          {
            !description ? null : props.utils.toReactComponent(
              ['section', { className: 'markdown' }].concat(getChildren(description)),
            )
          }
          {
            (!content.toc || content.toc.length <= 1 || meta.toc === false) ? null
              : (
                <Affix className="toc-affix" offsetTop={16}>
                  {
                    props.utils.toReactComponent(
                      ['ul', { className: 'toc' }].concat(getChildren(content.toc)),
                    )
                  }
                </Affix>
              )
          }
          {
            this.getArticle(props.utils.toReactComponent(
              ['section', { className: 'markdown' }].concat(getChildren(content.content)),
            ))
          }
          {
            props.utils.toReactComponent(
              ['section', {
                className: 'markdown api-container',
              }].concat(getChildren(content.api || ['placeholder'])),
            )
          }
        </article>
      </DocumentTitle>
    );
  }
}
