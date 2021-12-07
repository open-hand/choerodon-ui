import * as React from 'react';
import { observer } from 'mobx-react';
import Checkbox from 'choerodon-ui/lib/checkbox';
import Radio from 'choerodon-ui/lib/radio';
import { SelectionBoxProps, SelectionBoxState } from './Table';

@observer
export default class SelectionBox extends React.Component<SelectionBoxProps, SelectionBoxState> {
  constructor(props: SelectionBoxProps) {
    super(props);

    this.state = {
      checked: this.getCheckState(props),
    };
  }

  // eslint-disable-next-line class-methods-use-this
  getCheckState(props: SelectionBoxProps) {
    const { defaultSelection, rowIndex, store } = props;
    const { selectionDirty, selectedRowKeys } = store;
    let checked = false;
    if (selectionDirty) {
      checked = selectedRowKeys.indexOf(rowIndex) >= 0;
    } else {
      checked = selectedRowKeys.indexOf(rowIndex) >= 0 ||
        defaultSelection.indexOf(rowIndex) >= 0;
    }
    return checked;
  }

  render() {
    const checked = this.getCheckState(this.props);
    const { type, rowIndex, ...rest } = this.props;

    if (type === 'radio') {
      return <Radio checked={checked} value={rowIndex} {...rest} />;
    }
    return <Checkbox checked={checked} {...rest} />;
  }
}
