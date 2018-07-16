import React from 'react';

let Trigger; // eslint-disable-line

if (process.env.REACT === '15') {
  const ActualTrigger = require.requireActual('rc-trigger');
  const render = ActualTrigger.prototype.render;

  ActualTrigger.prototype.render = function () {
    const { state: { popupVisible }, getComponent } = this;
    let component;

    if (popupVisible || this._component) { // eslint-disable-line
      component = getComponent();
    }

    return (
      <div id="TriggerContainer">
        {render.call(this)}
        {component}
      </div>
    );
  };
  Trigger = ActualTrigger;
} else {
  const TriggerMock = require('rc-trigger/lib/mock'); // eslint-disable-line
  Trigger = TriggerMock;
}


export default Trigger;
