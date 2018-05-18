import React, { Component } from 'react';

class Nav extends Component {
  render() {
    const { props } = this;
    return (
      <div {...props} />
    );
  }
}


export default Nav;
