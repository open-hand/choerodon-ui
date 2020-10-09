import React, { Component } from 'react';
import { localeContext, message } from 'choerodon-ui/pro';
import CopyableIcon from './CopyableIcon';

const obsoleteIcon = ['outstanding_tasks', 'unallocated_question', 'unfinished_question'];

export default class Category extends Component {
  state = {
    justCopied: null,
  };

  onCopied = (type, text) => {
    message.success(
      <span>
        <code className="copied-code">{text}</code> copied 🎉
      </span>,
    );
    this.setState({ justCopied: type }, () => {
      setTimeout(() => {
        this.setState({ justCopied: null });
      }, 2000);
    });
  };

  render() {
    const { icons, title } = this.props;
    const { justCopied } = this.state;
    const items = icons.map(name => {
      if (obsoleteIcon.includes(name)) {
        return null;
      }
      return (
        <CopyableIcon
          key={name}
          type={name}
          justCopied={justCopied}
          onCopied={this.onCopied}
        />
      );
    });
    return (
      <div>
        <h3>{localeContext.get('Icon', title)}{localeContext.get('Icon', 'icons')}</h3>
        <ul className="c7nicons-list">{items}</ul>
      </div>
    );
  }
}
