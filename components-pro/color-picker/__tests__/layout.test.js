import fs from 'fs';
import path from 'path';
import less from 'less';
import LessPluginNpmImport from 'less-plugin-npm-import';
import postcss from 'postcss';

describe('ColorPicker layout styles', () => {
  let rules;
  const prefix = '.c7n-pro-color-picker';

  beforeAll(async () => {
    const filename = path.resolve(__dirname, '../style/index.less');
    const { css } = await less.render(fs.readFileSync(filename, 'utf8'), {
      filename,
      javascriptEnabled: true,
      plugins: [new LessPluginNpmImport({ prefix: '~' })],
    });
    rules = postcss.parse(css);
  });

  function declarations(selector, includeMedia = true) {
    const result = {};
    rules.walkRules(rule => {
      if (rule.selectors.includes(selector) && (includeMedia || rule.parent.type !== 'atrule')) {
        rule.walkDecls(declaration => { result[declaration.prop] = declaration.value; });
      }
    });
    return result;
  }

  function horizontalPadding(value = '0') {
    const [top, right = top, , left = right] = value.split(/\s+/);
    return { left, right };
  }

  function styles(element, properties) {
    const result = {};
    const priorities = {};
    rules.walkRules(rule => {
      if (rule.parent.type === 'atrule') return;
      if (!rule.nodes.some(node => node.type === 'decl' && properties.includes(node.prop))) return;
      rule.selectors.forEach(selector => {
        if (selector.includes('::') || /:-(?:webkit|moz|ms)-/.test(selector)) return;
        if (!element.matches(selector)) return;
        const expanded = selector.replace(/:not\(([^)]+)\)/g, '$1');
        const ids = (expanded.match(/#[\w-]+/g) || []).length;
        const classes = (expanded.match(/\.[\w-]+|\[[^\]]+\]|:[\w-]+/g) || []).length;
        const types = (expanded.replace(/#[\w-]+|\.[\w-]+|\[[^\]]+\]|:[\w-]+(?:\([^)]*\))?/g, '').match(/[\w-]+/g) || []).length;
        const specificity = ids * 10000 + classes * 100 + types;
        rule.walkDecls(declaration => {
          if (!properties.includes(declaration.prop)) return;
          const isPadding = /^padding(?:-(?:left|right))?$/.test(declaration.prop);
          const values = declaration.prop === 'padding' ? horizontalPadding(declaration.value) : {};
          const names = declaration.prop === 'padding' ? ['left', 'right'] : [isPadding ? declaration.prop.slice(8) : declaration.prop];
          names.forEach(name => {
            const priority = specificity + (declaration.important ? 1000000 : 0);
            if (priorities[name] === undefined || priority >= priorities[name]) {
              priorities[name] = priority;
              result[name] = declaration.prop === 'padding' ? values[name] : declaration.value;
            }
          });
        });
      });
    });
    return result;
  }

  function padding(element) {
    return styles(element, ['padding', 'padding-left', 'padding-right']);
  }

  it('fixes the panel at 312px and reserves 94px for Hex', () => {
    expect(declarations(`${prefix}-popup`)).toMatchObject({ width: '3.12rem', 'min-width': '3.12rem', 'flex-shrink': '0' });
    expect(declarations(`${prefix}-custom-panel`)).toMatchObject({ width: '3.12rem', 'min-width': '3.12rem', flex: 'none' });
    const panel = document.createElement('div');
    panel.className = 'c7n-pro-color-picker-popup-view-gradient';
    panel.innerHTML = '<div class="c7n-pro-color-picker-custom-panel"></div>';
    expect(styles(panel.firstElementChild, ['width', 'min-width', 'left', 'display'])).toEqual({ width: '3.12rem', 'min-width': '3.12rem', left: 'calc(3.12rem + 4px)', display: 'none' });
    expect(declarations(`${prefix}-popup-view-gradient ${prefix}-custom-panel`)).not.toHaveProperty('width');
    expect(declarations(`${prefix}-popup-footer-input > ${prefix}-popup-footer-input-color:first-of-type`)).toMatchObject({ width: '0.94rem', flex: 'none' });
    expect(declarations(`${prefix}-popup-footer-input-rgba`)).toMatchObject({ 'min-width': '1.78rem' });
    expect(declarations(`${prefix}-popup-footer-input-rgba ${prefix}-popup-footer-input-color:last-child`)).toMatchObject({ 'min-width': '0.52rem' });
  });

  it('fits the stop columns and footer widths inside the panel', () => {
    const toPixels = value => parseFloat(value) * 100;
    const paddingWidth = value => Object.values(horizontalPadding(value)).reduce((total, side) => total + toPixels(side), 0);
    const panelWidth = toPixels(declarations(`${prefix}-custom-panel`).width);
    const editorPadding = paddingWidth(declarations(`${prefix}-gradient-editor`).padding);
    const row = declarations(`${prefix}-stop-row`);
    const rowPadding = paddingWidth(row.padding);
    const columns = row['grid-template-columns'].match(/[\d.]+rem/g).map(toPixels);
    const rowWidth = columns.reduce((total, width) => total + width, 0) + toPixels(row.gap) * 2 + rowPadding;
    expect(rowWidth).toBeLessThanOrEqual(panelWidth - editorPadding);
    const hexWidth = toPixels(declarations(`${prefix}-popup-footer-input > ${prefix}-popup-footer-input-color:first-of-type`).width);
    const rgba = declarations(`${prefix}-popup-footer-input-rgba`);
    expect(hexWidth + toPixels(rgba['min-width']) + toPixels(rgba['margin-left'])).toBeLessThanOrEqual(panelWidth - editorPadding);
  });

  it('uses an 8px rounded track and circular stops without a preview', () => {
    expect(declarations(`${prefix}-stop-track`)).toMatchObject({ height: '0.08rem', 'border-radius': '0.05rem' });
    expect(declarations(`${prefix}-stop`)).toMatchObject({ width: '0.14rem', height: '0.14rem', 'border-radius': '50%' });
    expect(declarations(`${prefix}-gradient-preview`)).toEqual({});
    expect(declarations(`${prefix}-stop-list-header`)).toMatchObject({ display: 'flex', 'justify-content': 'space-between' });
  });

  it('protects numeric widths and gives alpha and stop inputs 8px padding', () => {
    expect(declarations(`${prefix}-preset-opacity`)).toMatchObject({ padding: '0.08rem 0.16rem' });
    expect(declarations(`${prefix}-preset-opacity input`)).toMatchObject({ width: '0.64rem', flex: 'none', padding: '0.02rem 0.08rem' });
    expect(declarations(`${prefix}-preset-opacity input[type='number']`)).toMatchObject({ appearance: 'textfield' });
    expect(declarations(`${prefix}-stop-row`)).toMatchObject({ 'grid-template-columns': '0.54rem minmax(1.56rem, 1fr) 0.28rem' });
    expect(declarations(`${prefix}-stop-row`)).not.toHaveProperty('padding');
    expect(declarations(`${prefix}-stop-row input[type='number']`)).toEqual({ appearance: 'textfield' });
    expect(declarations(`${prefix}-stop-row ${prefix}-stop-alpha`)).toMatchObject({ width: '0.52rem', flex: 'none' });
    expect(declarations(`${prefix}-stop-row input`)).toMatchObject({ padding: '0.02rem 0.08rem' });
    expect(declarations(`${prefix}-stop-row input:not(textarea):not(:last-child)`)).toMatchObject({ 'padding-right': '0.08rem' });
    expect(declarations(`${prefix}-stop-row input:not(textarea):not(:first-child)`)).toMatchObject({ 'padding-left': '0.08rem' });
  });

  it('keeps compiled padding above the shared input sibling pseudo classes', () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <div class="c7n-pro-color-picker-stop-row">
        <div class="c7n-pro-color-picker-stop-position"><input type="number" /><span>%</span></div>
        <div class="c7n-pro-color-picker-stop-color-alpha"><input class="c7n-pro-color-picker-stop-color" />
        <input class="c7n-pro-color-picker-stop-alpha" type="text" inputmode="decimal" /></div><button></button>
      </div>
      <div class="c7n-pro-color-picker-preset-opacity"><span></span><div></div><input type="number" /></div>
      <div class="c7n-pro-color-picker-popup-footer-input">
        <div class="c7n-pro-color-picker-popup-footer-input-color"><input /><span>Hex</span></div>
        <div class="c7n-pro-color-picker-popup-footer-input-rgba">
          ${['R', 'G', 'B', 'A'].map(channel => `<div class="c7n-pro-color-picker-popup-footer-input-color"><input /><span>${channel}</span></div>`).join('')}
        </div>
      </div>`;
    container.querySelectorAll(`${prefix}-stop-row input, ${prefix}-preset-opacity input`).forEach(input => {
      expect(padding(input)).toEqual({ left: '0.08rem', right: input.parentElement.classList.contains('c7n-pro-color-picker-stop-position') ? '0.24rem' : '0.08rem' });
    });
    container.querySelectorAll(`${prefix}-popup-footer-input-rgba input`).forEach(input => {
      expect(padding(input)).toEqual({ left: '0.04rem', right: '0.04rem' });
    });
    expect(padding(container.querySelector(`${prefix}-popup-footer-input-color input`))).toEqual({ left: '0.2rem', right: '0.04rem' });
    expect(styles(container.querySelector(`${prefix}-stop-position input`), ['width', 'flex', 'appearance'])).toEqual({ width: '100%', appearance: 'textfield' });
    expect(styles(container.querySelector(`${prefix}-stop-color`), ['flex', 'min-width', 'border-radius'])).toEqual({ flex: '1', 'min-width': '0', 'border-radius': '0.02rem 0 0 0.02rem' });
    expect(styles(container.querySelector(`${prefix}-stop-alpha`), ['width', 'flex', 'border-radius'])).toEqual({ width: '0.52rem', flex: 'none', 'border-radius': '0 0.02rem 0.02rem 0' });
    expect(styles(container.querySelector(`${prefix}-stop-row button`), ['width', 'flex'])).toEqual({ width: '0.28rem' });
    expect(styles(container.querySelector(`${prefix}-preset-opacity input`), ['width', 'flex', 'appearance'])).toEqual({ width: '0.64rem', flex: 'none', appearance: 'textfield' });
  });

  it('shares numeric input rules without changing interaction states', () => {
    ['input', 'input:not(textarea):not(:last-child)', 'input:not(textarea):not(:first-child)', "input[type='number']", "input[type='number']::-webkit-inner-spin-button", "input[type='number']::-webkit-outer-spin-button"].forEach(suffix => {
      const shared = [];
      rules.walkRules(rule => {
        if (suffix.includes(':not(') && !rule.nodes.some(node => node.type === 'decl' && node.value === '0.08rem')) return;
        if (rule.selectors.includes(`${prefix}-stop-row ${suffix}`) && rule.selectors.includes(`${prefix}-preset-opacity ${suffix}`)) shared.push(rule);
      });
      expect(shared).toHaveLength(1);
    });
    expect(declarations(`${prefix}-stop-row-active ${prefix}-stop-position input`)).toMatchObject({ 'border-color': '#3f51b5' });
    expect(declarations(`${prefix}-stop-active`)).toMatchObject({ 'z-index': '1', 'box-shadow': '0 0 0 2px #3f51b5' });
    expect(declarations(`${prefix}-stop:focus-visible`)).toMatchObject({ outline: '2px solid #3f51b5', 'outline-offset': '2px' });
    expect(declarations(`${prefix}-stop-row button:hover:not(:disabled):not([aria-disabled='true'])`)).toMatchObject({ color: '#3f51b5' });
    [':disabled', "[aria-disabled='true']"].forEach(state => {
      expect(declarations(`${prefix}-stop-row button${state}`)).toMatchObject({ cursor: 'not-allowed' });
    });
    expect(declarations(`${prefix}-stop-track-color`)).toMatchObject({ 'pointer-events': 'none' });
    expect(declarations(`${prefix}-popup-footer-slider .opacity::after`)).toMatchObject({ 'pointer-events': 'none', 'z-index': '-1' });
  });

  it('limits custom panel height only in short viewports', () => {
    expect(declarations(`${prefix}-custom-panel`, false)).not.toHaveProperty('max-height');
    const media = [];
    rules.walkAtRules('media', rule => {
      if (rule.params === '(max-height: 700px)') {
        media.push(rule);
      }
    });
    expect(media).toHaveLength(1);
    const panel = media[0].nodes.find(rule => rule.selector === `${prefix}-custom-panel`);
    expect(panel).toBeDefined();
    expect(Object.fromEntries(panel.nodes.map(declaration => [declaration.prop, declaration.value]))).toMatchObject({
      'max-height': 'calc(100vh - 0.16rem)',
      'overflow-x': 'hidden',
      'overflow-y': 'auto',
      '-ms-overflow-style': 'none',
      'scrollbar-width': 'none',
    });
    expect(declarations(`${prefix}-custom-panel::-webkit-scrollbar`)).toMatchObject({ width: '0' });
  });

  it('snapshots the stop columns and the merged track styles', () => {
    expect({
      row: declarations(`${prefix}-stop-row`),
      input: declarations(`${prefix}-stop-row input`),
      position: declarations(`${prefix}-stop-row ${prefix}-stop-position input[type='number']:not(:last-child)`),
      alpha: declarations(`${prefix}-stop-row ${prefix}-stop-alpha`),
      track: declarations(`${prefix}-stop-track`),
    }).toMatchSnapshot();
    const tracks = [];
    rules.walkRules(`${prefix}-stop-track`, rule => { tracks.push(rule); });
    expect(tracks).toHaveLength(1);
  });
});
