import React from 'react';
import jsdom from 'jsdom';
import { mount } from 'enzyme';
import JSFormatter from 'choerodon-ui/pro/lib/code-area/formatters/JSFormatter';
import CodeArea from '..';
import DataSet from '../../data-set';
// eslint-disable-next-line import/no-named-as-default
import JSONFormatter from '../formatters/JSONFormatter';

import 'choerodon-ui/pro/lib/code-area/lint/json';

if (typeof window !== 'undefined') {
  // eslint-disable-next-line global-require
  require('codemirror/mode/javascript/javascript');
}

describe('CodeArea-pro', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    const { JSDOM } = jsdom;
    const doc = new JSDOM('<!doctype html><html><body></body></html>');
    global.document = doc;
    global.window = doc.defaultView;
    global.document.body.createTextRange = function() {
      return {
        setEnd: () => {},
        setStart: () => {},
        getBoundingClientRect: () => ({ right: 0 }),
        getClientRects: () => {
          return {
            length: 0,
            left: 0,
            right: 0,
          };
        },
      };
    };
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('the codeArea json formatter and lint test', () => {
    const options = { mode: { name: 'javascript', json: true } };
    const jsonText = `{
      "compilerOptions": {
        "strictNullChecks": true,
        "moduleResolution": "node",
        "allowSyntheticDefaultImports": true,
        "experimentalDecorators": true,
        "jsx": "preserve",
        "noUnusedParameters": true,
        "noUnusedLocals": true,
        "declaration": true,
        "target": "es6",
        "lib": [
          "dom",
          "dom.iterable",
          "es7",
          "es2017.object"
        ]
      },
      "exclude": [
        "node_modules",
        "lib",
        "es"
      ]
    }
    `;

    const jsonStyle = { height: 500 };

    const ds = new DataSet({
      autoCreate: true,
      fields: [{ name: 'content', type: 'string', defaultValue: jsonText, required: true }],
    });

    const wrapper = mount(
      <CodeArea
        dataSet={ds}
        name="content"
        style={jsonStyle}
        formatter={JSONFormatter}
        options={options}
        formatHotKey="Home"
        unFormatHotKey="End"
      />,
    );
    wrapper.find('CodeArea').simulate('focus');
    wrapper.find('CodeArea').simulate('keydown', { key: 'Home' });
    wrapper.find('CodeArea').simulate('keydown', { key: 'End' });
    expect(wrapper).toMatchSnapshot();
  });
  it('the codeArea javascript formatter and lint test', () => {
    const options = { mode: 'javascript' };

    const jsText = `function getOptions() {
      var options = {
        "compilerOptions": {
          "strictNullChecks": true,
          "moduleResolution": "node",
          "allowSyntheticDefaultImports": true,
          "experimentalDecorators": true,
          "jsx": "preserve",
          "noUnusedParameters": true,
          "noUnusedLocals": true,
          "declaration": true,
          "target": "es6",
          "lib": [
            "dom",
            "dom.iterable",
            "es7",
            "es2017.object"
          ]
        },
        "exclude": [
          "node_modules",
          "lib",
          "es"
        ]
      };

      return options;
    }
    `;

    const jsStyle = { height: 500 };

    const ds = new DataSet({
      autoCreate: true,
      fields: [{ name: 'content', type: 'string', defaultValue: jsText, required: true }],
    });

    const wrapper = mount(
      <CodeArea
        dataSet={ds}
        name="content"
        style={jsStyle}
        formatter={JSFormatter}
        options={options}
      />,
    );
    wrapper.find('CodeArea').simulate('focus');
    wrapper.find('CodeArea').simulate('keydown', { key: 'Home' });
    wrapper.find('CodeArea').simulate('keydown', { key: 'End' });
    expect(wrapper).toMatchSnapshot();
  });
});
