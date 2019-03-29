import React, { Component } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { Icon } from 'choerodon-ui';

export default class CopyableIcon extends Component {
  handleCopy = (text) => {
    const { type, onCopied } = this.props;
    onCopied(type, text);
  };

  render() {
    const { type, justCopied } = this.props;
    const text = `<Icon type="${type}" />`;
    return (
      <CopyToClipboard text={text} onCopy={this.handleCopy}>
        <li className={justCopied ? 'copied' : ''}>
          <Icon type={type} />
          <span className="c7nicon-class">
            {type}
          </span>
        </li>
      </CopyToClipboard>
    );
  }
}
