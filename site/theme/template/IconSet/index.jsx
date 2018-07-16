import React from 'react';
import classNames from 'classnames';
import { Icon } from 'choerodon-ui';
import CopyableIcon from './CopyableIcon';

const { icons } = Icon;

export default class IconSet extends React.Component {
  static defaultProps = {};
  // Show badges

  newIcons = [];

  render() {
    const { className, catigory = 'default' } = this.props;
    const listClassName = classNames({
      'anticons-list': true,
      clearfix: true,
      [className]: !!className,
    });
    return (
      <ul className={listClassName}>
        {icons[catigory].map(type => (
          <CopyableIcon key={type} type={type} isNew={this.newIcons.indexOf(type) >= 0} />
        ))}
      </ul>
    );
  }
}
