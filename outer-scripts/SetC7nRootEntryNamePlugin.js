const { modifyEntryVars } = require('./utils');

class SetC7nRootEntryNamePlugin {
  static defaultOptions = {
    'c7n-root-entry-name': 'defaultVars',
  };

  constructor(options = {}) {
    this.options = { ...SetC7nRootEntryNamePlugin.defaultOptions, ...options };
  }

  apply(compiler) {
    compiler.hooks.environment.tap('SetC7nRootEntryNamePlugin', () => {
      modifyEntryVars(this.options['c7n-root-entry-name']);
    });
  }
}

module.exports = SetC7nRootEntryNamePlugin;
