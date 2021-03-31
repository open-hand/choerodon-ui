/* eslint jsx-a11y/no-noninteractive-element-interactions: 0 */
import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import CopyToClipboard from 'react-copy-to-clipboard';
import classNames from 'classnames';
import LZString from 'lz-string';
import { Icon, Tooltip } from 'choerodon-ui';
import ReactIntersectionObserver from 'react-intersection-observer';
import stackblitzSdk from '@stackblitz/sdk';
import EditButton from './EditButton';
import BrowserFrame from '../BrowserFrame';

function compress(string) {
  return LZString.compressToBase64(string)
    .replace(/\+/g, '-') // Convert '+' to '-'
    .replace(/\//g, '_') // Convert '/' to '_'
    .replace(/=+$/, ''); // Remove ending '='
}

export default class Demo extends React.Component {
  static contextTypes = {
    intl: PropTypes.object,
  };

  constructor(props) {
    super(props);

    this.state = {
      codeExpand: false,
      sourceCode: '',
      copied: false,
      copyTooltipVisible: false,
      refreshKey: Date.now(),
    };
  }

  componentWillReceiveProps(nextProps) {
    const { highlightedCode } = nextProps;
    const div = document.createElement('div');
    div.innerHTML = highlightedCode[1].highlighted;
    this.setState({ sourceCode: div.textContent });
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { expand } = this.props;
    const { codeExpand, copied, copyTooltipVisible, refreshKey } = this.state;
    return (
      refreshKey !== nextState.refreshKey ||
      (codeExpand || expand) !== (nextState.codeExpand || nextProps.expand) ||
      copied !== nextState.copied ||
      copyTooltipVisible !== nextState.copyTooltipVisible
    );
  }

  componentDidMount() {
    const { meta, location } = this.props;
    if (meta.id === location.hash.slice(1)) {
      this.anchor.click();
    }
    this.componentWillReceiveProps(this.props);
  }

  handleCodeExpand = () => {
    const { codeExpand } = this.state;
    this.setState({ codeExpand: !codeExpand });
  };

  saveAnchor = anchor => {
    this.anchor = anchor;
  };

  handleCodeCopied = () => {
    this.setState({ copied: true });
  };

  refresh = () => {
    this.setState({
      refreshKey: Date.now(),
    });
  };

  onCopyTooltipVisibleChange = visible => {
    if (visible) {
      this.setState({
        copyTooltipVisible: visible,
        copied: false,
      });
      return;
    }
    this.setState({
      copyTooltipVisible: visible,
    });
  };

  // eslint-disable-next-line
  track({ type, demo }) {
    if (!window.gtag) {
      return;
    }
    window.gtag('event', 'demo', {
      event_category: type,
      event_label: demo,
    });
  }

  render() {
    const { state } = this;
    const { props } = this;
    const { meta, src, content, preview, highlightedCode, style, highlightedStyle, expand } = props;
    if (!this.liveDemo) {
      this.liveDemo = meta.iframe ? (
        <BrowserFrame>
          <iframe src={src} height={meta.iframe} title="demo" />
        </BrowserFrame>
      ) : (
        preview(React, ReactDOM)
      );
    }
    const codeExpand = state.codeExpand || expand;
    const codeBoxClass = classNames({
      'code-box': true,
      expand: codeExpand,
    });

    const {
      intl: { locale },
    } = this.context;
    const localizedTitle = meta.title[locale] || meta.title;
    const localizeIntro = content[locale] || content;
    const introChildren = props.utils.toReactComponent(['div'].concat(localizeIntro));

    const highlightClass = classNames({
      'highlight-wrapper': true,
      'highlight-wrapper-expand': codeExpand,
    });

    const prefillStyle = `@import 'choerodon-ui/dist/choerodon-ui.css';\n\n${style || ''}`.replace(
      new RegExp(`#${meta.id}\\s*`, 'g'),
      '',
    );
    const html = `<div id="container" style="padding: 24px"></div>
<script>
  var mountNode = document.getElementById('container');
</script>`;

    const codepenPrefillConfig = {
      title: `${localizedTitle} - Choerodon UI Demo`,
      html,
      js: state.sourceCode
        .replace(
          /import\s+\{\s+([\s\S]*)\s+\}\s+from\s+'choerodon-ui';/,
          'const { $1 } = window["choerodon-ui"];',
        )
        .replace(
          /import\s+\{\s+([\s\S]*)\s+\}\s+from\s+'choerodon-ui\/pro';/,
          'const { $1 } = window["choerodon-ui/pro"];',
        ),
      css: prefillStyle,
      editors: '001',
      css_external: ['choerodon-ui/dist/choerodon-ui.css', 'choerodon-ui/dist/choerodon-ui-pro.css']
        .map(css => `https://unpkg.com/${css}`)
        .join(';'),
      js_external: [
        'react@16.12.x/umd/react.production.min.js',
        'react-dom@16.12.x/umd/react-dom.production.min.js',
        'moment/min/moment-with-locales.min.js',
        'mobx@4.7.0/lib/mobx.umd.min.js',
        'mobx-react@5.1.x/index.min.js',
        'choerodon-ui/dist/choerodon-ui-demo-data-mock.min.js',
        'choerodon-ui/dist/choerodon-ui-with-locales.js',
        'choerodon-ui/dist/choerodon-ui-pro-with-locales.js',
      ]
        .map(url => `https://unpkg.com/${url}`)
        .join(';'),
      js_pre_processor: 'typescript',
    };
    const dependencies = state.sourceCode.split('\n').reduce(
      (acc, line) => {
        const matches = line.match(/import .+? from '(.+)';$/);
        if (matches && matches[1] && !line.includes('choerodon-ui')) {
          acc[matches[1]] = 'latest';
        }
        return acc;
      },
      {
        react: 'latest',
        'react-dom': 'latest',
        axios: 'latest',
        moment: 'latest',
        mobx: '4.7.0',
        lodash: '^4.17.15',
        'mobx-react': '5.1.2',
        'choerodon-ui': 'latest',
      },
    );
    const codesanboxPrefillConfig = {
      files: {
        'package.json': {
          content: {
            dependencies,
          },
        },
        'index.css': {
          content: (style || '').replace(new RegExp(`#${meta.id}\\s*`, 'g'), ''),
        },
        'index.js': {
          content: `
import React from 'react';
import ReactDOM from 'react-dom';
import 'choerodon-ui/dist/choerodon-ui.css';
import 'choerodon-ui/dist/choerodon-ui-pro.css';
import 'choerodon-ui/dist/choerodon-ui-demo-data-mock.min.js';
import './index.css';
${state.sourceCode.replace('mountNode', 'document.getElementById(\'container\')')}
          `,
        },
        'index.html': {
          content: html,
        },
      },
    };
    const stackblitzPrefillConfig = {
      title: `${localizedTitle} - Choerodon UI Demo`,
      template: 'create-react-app',
      dependencies,
      files: {
        'index.css': (style || '').replace(new RegExp(`#${meta.id}\\s*`, 'g'), ''),
        'index.js': `
import React from 'react';
import ReactDOM from 'react-dom';
import 'choerodon-ui/dist/choerodon-ui.css';
import 'choerodon-ui/dist/choerodon-ui-pro.css';
import 'choerodon-ui/dist/choerodon-ui-demo-data-mock.min.js';
import './index.css';
${state.sourceCode.replace('mountNode', 'document.getElementById(\'container\')')}
          `,
        'index.html': html,
      },
    };
    return (
      <section className={codeBoxClass} id={meta.id}>
        <ReactIntersectionObserver triggerOnce>
          {
            ({ inView, ref }) => (
              <section ref={ref} className="code-box-demo" style={inView ? undefined : { minHeight: 300 }}>
                {inView && React.cloneElement(this.liveDemo, { key: state.refreshKey })}
                {style ? <style dangerouslySetInnerHTML={{ __html: style }} /> : null}
              </section>
            )
          }
        </ReactIntersectionObserver>
        <section className="code-box-meta markdown">
          <div className="code-box-title">
            <a href={`#${meta.id}`} ref={this.saveAnchor}>
              {localizedTitle}
            </a>
            <EditButton
              title={<FormattedMessage id="app.content.edit-page" />}
              filename={meta.filename}
            />
          </div>
          {introChildren}
          <Tooltip title="Refresh Demo">
            <Icon type="refresh" onClick={this.refresh} className="code-refresh-icon" />
          </Tooltip>
          <Tooltip title={codeExpand ? 'Hide Code' : 'Show Code'}>
            <span className="code-expand-icon">
              <img
                alt="expand code"
                src="https://gw.alipayobjects.com/zos/rmsportal/wSAkBuJFbdxsosKKpqyq.svg"
                className={codeExpand ? 'code-expand-icon-hide' : 'code-expand-icon-show'}
                onClick={this.handleCodeExpand}
              />
              <img
                alt="expand code"
                src="https://gw.alipayobjects.com/zos/rmsportal/OpROPHYqWmrMDBFMZtKF.svg"
                className={codeExpand ? 'code-expand-icon-show' : 'code-expand-icon-hide'}
                onClick={this.handleCodeExpand}
              />
            </span>
          </Tooltip>
        </section>
        <section className={highlightClass} key="code">
          <div className="highlight">
            <div className="code-box-actions">
              <form action="https://codepen.io/pen/define" method="POST" target="_blank">
                <input type="hidden" name="data" value={JSON.stringify(codepenPrefillConfig)} />
                <Tooltip title={<FormattedMessage id="app.demo.codepen" />}>
                  <input
                    type="submit"
                    value="Create New Pen with Prefilled Data"
                    className="code-box-codepen"
                  />
                </Tooltip>
              </form>
              <form
                action="https://codesandbox.io/api/v1/sandboxes/define"
                method="POST"
                target="_blank"
              >
                <input
                  type="hidden"
                  name="parameters"
                  value={compress(JSON.stringify(codesanboxPrefillConfig))}
                />
                <Tooltip title={<FormattedMessage id="app.demo.codesandbox" />}>
                  <input
                    type="submit"
                    value="Create New Sandbox with Prefilled Data"
                    className="code-box-codesandbox"
                  />
                </Tooltip>
              </form>
              <Tooltip title={<FormattedMessage id="app.demo.stackblitz" />}>
                <span
                  className="code-box-stackblitz"
                  onClick={() => {
                    this.track({ type: 'stackblitz', demo: meta.id });
                    stackblitzSdk.openProject(stackblitzPrefillConfig);
                  }}
                >
                  <Icon type="priority" />
                </span>
              </Tooltip>
              <CopyToClipboard text={state.sourceCode} onCopy={this.handleCodeCopied}>
                <Tooltip
                  visible={state.copyTooltipVisible}
                  onVisibleChange={this.onCopyTooltipVisibleChange}
                  title={<FormattedMessage id={`app.demo.${state.copied ? 'copied' : 'copy'}`} />}
                >
                  <Icon
                    type={state.copied && state.copyTooltipVisible ? 'check' : 'content_copy'}
                    className="code-box-code-copy"
                  />
                </Tooltip>
              </CopyToClipboard>
            </div>
            {props.utils.toReactComponent(highlightedCode)}
          </div>
          {highlightedStyle ? (
            <div key="style" className="highlight">
              <pre>
                <code className="css" dangerouslySetInnerHTML={{ __html: highlightedStyle }} />
              </pre>
            </div>
          ) : null}
        </section>
      </section>
    );
  }
}
