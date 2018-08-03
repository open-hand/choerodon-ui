import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Icon from '../../icon';
import Input from '../../input';
import Button from '../../button';
import { saveRef } from './util';

class FilterInput extends Component {
  static propTypes = {
    prefixCls: PropTypes.string,
    placeholder: PropTypes.string,
    onChange: PropTypes.func,
  };

  constructor(props) {
    super(props);
    const value = props.filterValue || '';
    this.state = {
      value,
    }
  }

  componentWillReceiveProps = nextProps => {
    if ('filterValue' in nextProps) {
      const value = nextProps.filterValue;
      this.setState({
        value,
      });
    }
  }

  handleChange = (event,input) => {
    const { onChange } = this.props;
    onChange(event.target.value);
    this.setState({
      value: event.target.value
    });
  }

  clearInputValue = () => {
    const { onChange } = this.props;
    onChange('');
  }

  focus = () => {
    this.filterInputRef.focus();
  }

  blur = () => {
    this.filterInputRef.blur();
  }

  render() {
    const { prefixCls, placeholder, underline } = this.props;
    const { value } = this.state;
    const suffix = value && <Button size='small' onClick={this.clearInputValue} shape="circle" icon="close" />;
    return (
      <div className={`${prefixCls}-filter`}>
        <span className={`${prefixCls}-filter-input`}>
          <Input
            value={value}
            placeholder={placeholder}
            prefix={<Icon type="search" />}
            suffix={suffix}
            onChange={this.handleChange}
            underline={underline}
            ref={saveRef(this, 'filterInputRef')}
          />
        </span>
      </div>
    );
  }
}

export default FilterInput;
