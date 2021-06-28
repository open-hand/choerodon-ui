import React from 'react';
import ReactDOM from 'react-dom';
import { Select, Button, TextField } from 'choerodon-ui/pro';

function handleChange(value, oldValue) {
  console.log('[basic new]', value, '[basic old]', oldValue);
}

const { Option } = Select;
const SelectContent = ({ children, dataSet, textField, valueField, setPopup }) => {
  const [value, setValue] = React.useState('');
  const handleAdd = React.useCallback(() => {
    if (value && !dataSet.find((record) => record.get(valueField) === value)) {
      dataSet.create({ [textField]: value, [valueField]: value });
    }
  }, [dataSet, textField, valueField, value]);
  const handleClose = React.useCallback(() => {
    setPopup(false);
  }, [setPopup]);
  return (
    <>
      {children}
      <div style={{ display: 'flex' }}>
        <TextField value={value} onChange={setValue} style={{ flex: 1 }} tabIndex={1} />
        <Button onClick={handleAdd} tabIndex={3}>Add</Button>
        <Button onClick={handleClose} tabIndex={2}>Close</Button>
      </div>
    </>
  );
};

class App extends React.Component {
  renderPopupContent = ({ content, dataSet, textField, valueField, setPopup }) => {
    return (
      <SelectContent dataSet={dataSet} textField={textField} valueField={valueField} setPopup={setPopup}>
        {content}
      </SelectContent>
    );
  };

  render() {
    return (
      <Select
        placeholder="请选择"
        popupContent={this.renderPopupContent}
        tabIntoPopupContent
      >
        <Option value="jack"><em>Jack</em> </Option>
        <Option value="lucy">Lucy</Option>
        <Option value="wu">
          Wu
        </Option>
      </Select>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
