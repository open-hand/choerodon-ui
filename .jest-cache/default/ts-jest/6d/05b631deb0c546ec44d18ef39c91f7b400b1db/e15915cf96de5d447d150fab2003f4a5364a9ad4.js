import { __decorate } from "tslib";
import React from 'react';
import PropTypes from 'prop-types';
import { action, observable, autorun } from 'mobx';
import { observer } from 'mobx-react';
import isString from 'lodash/isString';
import isEqual from 'lodash/isEqual';
import omit from 'lodash/omit';
import noop from 'lodash/noop';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import ObserverFormField from '../field';
import autobind from '../_util/autobind';
let CodeMirror;
if (typeof window !== 'undefined') {
    // eslint-disable-next-line global-require
    CodeMirror = require('react-codemirror2').Controlled;
}
const defaultCodeMirrorOptions = {
    theme: 'neat',
    lineNumbers: true,
    lint: true,
    gutters: ['CodeMirror-lint-markers'],
};
let CodeArea = class CodeArea extends ObserverFormField {
    constructor(props, content) {
        super(props, content);
        this.cmOptions = this.getCodeMirrorOptions();
        /**
         * 编辑器失去焦点时，调用父类方法，同步DataSet中的内容
         *
         * @memberof CodeArea
         */
        this.handleCodeMirrorBlur = (codeMirrorInstance) => {
            const { formatter } = this.props;
            // 更新DataSet的值之前，先去拿到原始的raw格式
            const codeMirrorText = codeMirrorInstance.getValue();
            const value = formatter ? formatter.getRaw(codeMirrorText) : codeMirrorText;
            this.midText = value;
            this.setValue(value);
        };
        /**
         * 在CodeMirror编辑器实例挂载前添加额外配置
         *
         * @memberof CodeArea
         */
        this.handleCodeMirrorDidMount = (editor) => {
            const { formatter, style, formatHotKey, unFormatHotKey } = this.props;
            const { width = '100%', height = 100 } = style || {};
            const options = {
                Tab(cm) {
                    if (cm.somethingSelected()) {
                        cm.indentSelection('add'); // 有选中内容时整体缩进
                    }
                    else {
                        // 使用空格代替缩进
                        const spaces = Array(cm.getOption('indentUnit') + 1).join(' ');
                        cm.replaceSelection(spaces);
                    }
                },
            };
            if (formatter) {
                if (formatHotKey) {
                    // default: 'Alt-F'
                    options[formatHotKey] = cm => cm.setValue(formatter.getFormatted(cm.getValue()));
                }
                if (unFormatHotKey) {
                    // default: 'Alt-R'
                    options[unFormatHotKey] = cm => cm.setValue(formatter.getRaw(cm.getValue()));
                }
            }
            editor.setSize(width, height); // default size: ('100%', 100)
            editor.setOption('extraKeys', options);
        };
        autorun(() => {
            // 在绑定dataSet的情况下
            // 当手动修改过codeArea里面的值以后 再使用record.set去更新值 组件不会更新
            // 原因在于此时 this.text 不为 undefined 因此 getTextNode 的计算值不会进行改变 导致组件不重新渲染
            // 其他的组件会对 this.text 在blur的时候进行undefined的修改 但是这个组件不能这么做
            // 原因在于 record 中的值为 raw的非格式化数据 blur后因为进行了一次record数据的修改 所以再次重新那数据必然导致
            // 当数据存在错误的时候  codeArea去格式化 因为格式化失败了
            // 当数据不存在存在错误的时候即使特地将其去格式化也依旧会被格式化
            // 因此需要使用中间变量进行处理
            const { formatter } = this.props;
            const recordValue = this.getValue();
            const value = formatter ? formatter.getFormatted(recordValue) : recordValue;
            // 判断跟中间值是否一致 通过这个判断 数据的来源是 blur的时候设置的值 还是直接通过外部进行修改的值
            if (recordValue !== this.midText) {
                this.setText(value);
            }
        });
    }
    handleBeforeChange(_editor, _data, value) {
        this.setText(value);
    }
    handleCodeMirrorKeyDown(cm, e) {
        const { onKeyDown = noop, onEnterDown = noop } = this.props;
        switch (e.keyCode) {
            case KeyCode.ENTER:
                onEnterDown(e);
                break;
            case KeyCode.ESC:
                cm.getInputField().blur();
                break;
            default:
        }
        onKeyDown(e);
    }
    getCodeMirrorOptions(options = this.props.options) {
        return { ...defaultCodeMirrorOptions, ...options };
    }
    getOtherProps() {
        const otherProps = omit(super.getOtherProps(), ['onChange', 'formatHotKey', 'unFormatHotKey']);
        otherProps.onKeyDown = this.handleCodeMirrorKeyDown;
        return otherProps;
    }
    componentWillReceiveProps(nextProps, nextContext) {
        const { options } = nextProps;
        if (!isEqual(options, this.props.options)) {
            this.cmOptions = this.getCodeMirrorOptions(options);
        }
        super.componentWillReceiveProps(nextProps, nextContext);
    }
    renderWrapper() {
        if (CodeMirror) {
            this.cmOptions.readOnly = this.isDisabled() ? 'nocursor' : this.isReadOnly();
            const text = this.getTextNode();
            return (React.createElement("div", Object.assign({}, this.getWrapperProps()),
                React.createElement("label", null,
                    React.createElement(CodeMirror, Object.assign({}, this.getOtherProps(), { value: isString(text) ? text : this.getText(this.getValue()), options: this.cmOptions, onBeforeChange: this.handleBeforeChange, onBlur: this.handleCodeMirrorBlur, editorDidMount: this.handleCodeMirrorDidMount })),
                    this.renderFloatLabel())));
        }
    }
    setText(text) {
        this.text = text;
    }
    getTextNode() {
        return this.text === undefined ? super.getTextNode() || '' : this.text;
    }
    processValue(value) {
        const text = super.processValue(value);
        const { formatter } = this.props;
        return formatter ? formatter.getFormatted(text) : text;
    }
};
CodeArea.displayName = 'CodeArea';
CodeArea.propTypes = {
    options: PropTypes.object,
    formatHotKey: PropTypes.string,
    unFormatHotKey: PropTypes.string,
    formatter: PropTypes.object,
    ...ObserverFormField.propTypes,
};
CodeArea.defaultProps = {
    ...ObserverFormField.defaultProps,
    suffixCls: 'code-area',
    formatHotKey: 'Alt-F',
    unFormatHotKey: 'Alt-R',
};
__decorate([
    observable
], CodeArea.prototype, "text", void 0);
__decorate([
    autobind
], CodeArea.prototype, "handleBeforeChange", null);
__decorate([
    autobind
], CodeArea.prototype, "handleCodeMirrorKeyDown", null);
__decorate([
    action
], CodeArea.prototype, "setText", null);
CodeArea = __decorate([
    observer
], CodeArea);
export default CodeArea;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL2NvZGUtYXJlYS9Db2RlQXJlYS50c3giLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sS0FBb0MsTUFBTSxPQUFPLENBQUM7QUFDekQsT0FBTyxTQUFTLE1BQU0sWUFBWSxDQUFDO0FBQ25DLE9BQU8sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUNuRCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBR3RDLE9BQU8sUUFBUSxNQUFNLGlCQUFpQixDQUFDO0FBQ3ZDLE9BQU8sT0FBTyxNQUFNLGdCQUFnQixDQUFDO0FBQ3JDLE9BQU8sSUFBSSxNQUFNLGFBQWEsQ0FBQztBQUMvQixPQUFPLElBQUksTUFBTSxhQUFhLENBQUM7QUFDL0IsT0FBTyxPQUFPLE1BQU0sZ0NBQWdDLENBQUM7QUFDckQsT0FBTyxpQkFBaUIsTUFBTSxVQUFVLENBQUM7QUFHekMsT0FBTyxRQUFRLE1BQU0sbUJBQW1CLENBQUM7QUFFekMsSUFBSSxVQUEyQyxDQUFDO0FBRWhELElBQUksT0FBTyxNQUFNLEtBQUssV0FBVyxFQUFFO0lBQ2pDLDBDQUEwQztJQUMxQyxVQUFVLEdBQUcsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUMsVUFBVSxDQUFDO0NBQ3REO0FBU0QsTUFBTSx3QkFBd0IsR0FBd0I7SUFDcEQsS0FBSyxFQUFFLE1BQU07SUFDYixXQUFXLEVBQUUsSUFBSTtJQUNqQixJQUFJLEVBQUUsSUFBSTtJQUNWLE9BQU8sRUFBRSxDQUFDLHlCQUF5QixDQUFDO0NBQ3JDLENBQUM7QUFHRixJQUFxQixRQUFRLEdBQTdCLE1BQXFCLFFBQVMsU0FBUSxpQkFBZ0M7SUF3QnBFLFlBQVksS0FBSyxFQUFFLE9BQU87UUFDeEIsS0FBSyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQTtRQVB2QixjQUFTLEdBQXdCLElBQUksQ0FBQyxvQkFBb0Is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QUMsQ0FBRSxLQUFLLENBQUMsV0FBVyxFQUFhLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO0lBQ3JGLENBQUM7SUFFRCxZQUFZLENBQUMsS0FBVTtRQUNyQixNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3ZDLE1BQU0sRUFBRSxTQUFTLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ2pDLE9BQU8sU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7SUFDekQsQ0FBQztDQWdERixDQUFBO0FBcktRLG9CQUFXLEdBQUcsVUFBVSxDQUFDO0FBRXpCLGtCQUFTLEdBQUc7SUFDakIsT0FBTyxFQUFFLFNBQVMsQ0FBQyxNQUFNO0lBQ3pCLFlBQVksRUFBRSxTQUFTLENBQUMsTUFBTTtJQUM5QixjQUFjLEVBQUUsU0FBUyxDQUFDLE1BQU07SUFDaEMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxNQUFNO0lBQzNCLEdBQUcsaUJBQWlCLENBQUMsU0FBUztDQUMvQixDQUFDO0FBRUsscUJBQVksR0FBRztJQUNwQixHQUFHLGlCQUFpQixDQUFDLFlBQVk7SUFDakMsU0FBUyxFQUFFLFdBQVc7SUFDdEIsWUFBWSxFQUFFLE9BQU87SUFDckIsY0FBYyxFQUFFLE9BQU87Q0FDeEIsQ0FBQztBQUlVO0lBQVgsVUFBVTtzQ0FBZTtBQTBCMUI7SUFEQyxRQUFRO2tEQUdSO0FBR0Q7SUFEQyxRQUFRO3VEQWFSO0FBMkNEO0lBREMsTUFBTTt1Q0FHTjtBQTVHa0IsUUFBUTtJQUQ1QixRQUFRO0dBQ1ksUUFBUSxDQXNLNUI7ZUF0S29CLFFBQVEiLCJuYW1lcyI6W10sInNvdXJjZXMiOlsiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL2NvZGUtYXJlYS9Db2RlQXJlYS50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0LCB7IENvbXBvbmVudENsYXNzLCBSZWFjdE5vZGUgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IHsgYWN0aW9uLCBvYnNlcnZhYmxlLCBhdXRvcnVuIH0gZnJvbSAnbW9ieCc7XG5pbXBvcnQgeyBvYnNlcnZlciB9IGZyb20gJ21vYngtcmVhY3QnO1xuaW1wb3J0IHsgRWRpdG9yQ29uZmlndXJhdGlvbiB9IGZyb20gJ2NvZGVtaXJyb3InO1xuaW1wb3J0IHsgSUNvbnRyb2xsZWRDb2RlTWlycm9yIGFzIENvZGVNaXJyb3JQcm9wcywgSUluc3RhbmNlIH0gZnJvbSAncmVhY3QtY29kZW1pcnJvcjInO1xuaW1wb3J0IGlzU3RyaW5nIGZyb20gJ2xvZGFzaC9pc1N0cmluZyc7XG5pbXBvcnQgaXNFcXVhbCBmcm9tICdsb2Rhc2gvaXNFcXVhbCc7XG5pbXBvcnQgb21pdCBmcm9tICdsb2Rhc2gvb21pdCc7XG5pbXBvcnQgbm9vcCBmcm9tICdsb2Rhc2gvbm9vcCc7XG5pbXBvcnQgS2V5Q29kZSBmcm9tICdjaG9lcm9kb24tdWkvbGliL191dGlsL0tleUNvZGUnO1xuaW1wb3J0IE9ic2VydmVyRm9ybUZpZWxkIGZyb20gJy4uL2ZpZWxkJztcbmltcG9ydCB7IEZvcm1GaWVsZFByb3BzIH0gZnJvbSAnLi4vZmllbGQvRm9ybUZpZWxkJztcbmltcG9ydCB7IENvZGVBcmVhRm9ybWF0dGVyIH0gZnJvbSAnLi9Db2RlQXJlYUZvcm1hdHRlcic7XG5pbXBvcnQgYXV0b2JpbmQgZnJvbSAnLi4vX3V0aWwvYXV0b2JpbmQnO1xuXG5sZXQgQ29kZU1pcnJvcjogQ29tcG9uZW50Q2xhc3M8Q29kZU1pcnJvclByb3BzPjtcblxuaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBnbG9iYWwtcmVxdWlyZVxuICBDb2RlTWlycm9yID0gcmVxdWlyZSgncmVhY3QtY29kZW1pcnJvcjInKS5Db250cm9sbGVkO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIENvZGVBcmVhUHJvcHMgZXh0ZW5kcyBGb3JtRmllbGRQcm9wcyB7XG4gIG9wdGlvbnM/OiBFZGl0b3JDb25maWd1cmF0aW9uO1xuICBmb3JtYXRIb3RLZXk/OiBzdHJpbmc7XG4gIHVuRm9ybWF0SG90S2V5Pzogc3RyaW5nO1xuICBmb3JtYXR0ZXI/OiBDb2RlQXJlYUZvcm1hdHRlcjtcbn1cblxuY29uc3QgZGVmYXVsdENvZGVNaXJyb3JPcHRpb25zOiBFZGl0b3JDb25maWd1cmF0aW9uID0ge1xuICB0aGVtZTogJ25lYXQnLFxuICBsaW5lTnVtYmVyczogdHJ1ZSxcbiAgbGludDogdHJ1ZSxcbiAgZ3V0dGVyczogWydDb2RlTWlycm9yLWxpbnQtbWFya2VycyddLFxufTtcblxuQG9ic2VydmVyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb2RlQXJlYSBleHRlbmRzIE9ic2VydmVyRm9ybUZpZWxkPENvZGVBcmVhUHJvcHM+IHtcbiAgc3RhdGljIGRpc3BsYXlOYW1lID0gJ0NvZGVBcmVhJztcblxuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIG9wdGlvbnM6IFByb3BUeXBlcy5vYmplY3QsXG4gICAgZm9ybWF0SG90S2V5OiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIHVuRm9ybWF0SG90S2V5OiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIGZvcm1hdHRlcjogUHJvcFR5cGVzLm9iamVjdCxcbiAgICAuLi5PYnNlcnZlckZvcm1GaWVsZC5wcm9wVHlwZXMsXG4gIH07XG5cbiAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICAuLi5PYnNlcnZlckZvcm1GaWVsZC5kZWZhdWx0UHJvcHMsXG4gICAgc3VmZml4Q2xzOiAnY29kZS1hcmVhJyxcbiAgICBmb3JtYXRIb3RLZXk6ICdBbHQtRicsXG4gICAgdW5Gb3JtYXRIb3RLZXk6ICdBbHQtUicsXG4gIH07XG5cbiAgY21PcHRpb25zOiBFZGl0b3JDb25maWd1cmF0aW9uID0gdGhpcy5nZXRDb2RlTWlycm9yT3B0aW9ucygpO1xuXG4gIEBvYnNlcnZhYmxlIHRleHQ/OiBzdHJpbmc7XG5cbiAgbWlkVGV4dDogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzLCBjb250ZW50KSB7XG4gICAgc3VwZXIocHJvcHMsIGNvbnRlbnQpXG4gICAgYXV0b3J1bigoKSA9PiB7XG4gICAgICAvLyDlnKjnu5HlrppkYXRhU2V055qE5oOF5Ya15LiLXG4gICAgICAvLyDlvZPmiYvliqjkv67mlLnov4djb2RlQXJlYemHjOmdoueahOWAvOS7peWQjiDlho3kvb/nlKhyZWNvcmQuc2V05Y675pu05paw5YC8IOe7hOS7tuS4jeS8muabtOaWsFxuICAgICAgLy8g5Y6f5Zug5Zyo5LqO5q2k5pe2IHRoaXMudGV4dCDkuI3kuLogdW5kZWZpbmVkIOWboOatpCBnZXRUZXh0Tm9kZSDnmoTorqHnrpflgLzkuI3kvJrov5vooYzmlLnlj5gg5a+86Ie057uE5Lu25LiN6YeN5paw5riy5p+TXG4gICAgICAvLyDlhbbku5bnmoTnu4Tku7bkvJrlr7kgdGhpcy50ZXh0IOWcqGJsdXLnmoTml7blgJnov5vooYx1bmRlZmluZWTnmoTkv67mlLkg5L2G5piv6L+Z5Liq57uE5Lu25LiN6IO96L+Z5LmI5YGaXG4gICAgICAvLyDljp/lm6DlnKjkuo4gcmVjb3JkIOS4reeahOWAvOS4uiByYXfnmoTpnZ7moLzlvI/ljJbmlbDmja4gYmx1cuWQjuWboOS4uui/m+ihjOS6huS4gOasoXJlY29yZOaVsOaNrueahOS/ruaUuSDmiYDku6Xlho3mrKHph43mlrDpgqPmlbDmja7lv4XnhLblr7zoh7RcbiAgICAgIC8vIOW9k+aVsOaNruWtmOWcqOmUmeivr+eahOaXtuWAmSAgY29kZUFyZWHljrvmoLzlvI/ljJYg5Zug5Li65qC85byP5YyW5aSx6LSl5LqGXG4gICAgICAvLyDlvZPmlbDmja7kuI3lrZjlnKjlrZjlnKjplJnor6/nmoTml7blgJnljbPkvb/nibnlnLDlsIblhbbljrvmoLzlvI/ljJbkuZ/kvp3ml6fkvJrooqvmoLzlvI/ljJZcbiAgICAgIC8vIOWboOatpOmcgOimgeS9v+eUqOS4remXtOWPmOmHj+i/m+ihjOWkhOeQhlxuICAgICAgY29uc3QgeyBmb3JtYXR0ZXIgfSA9IHRoaXMucHJvcHM7XG4gICAgICBjb25zdCByZWNvcmRWYWx1ZSA9IHRoaXMuZ2V0VmFsdWUoKVxuICAgICAgY29uc3QgdmFsdWUgPSBmb3JtYXR0ZXIgPyBmb3JtYXR0ZXIuZ2V0Rm9ybWF0dGVkKHJlY29yZFZhbHVlKSA6IHJlY29yZFZhbHVlO1xuICAgICAgLy8g5Yik5pat6Lef5Lit6Ze05YC85piv5ZCm5LiA6Ie0IOmAmui/h+i/meS4quWIpOaWrSDmlbDmja7nmoTmnaXmupDmmK8gYmx1cueahOaXtuWAmeiuvue9rueahOWAvCDov5jmmK/nm7TmjqXpgJrov4flpJbpg6jov5vooYzkv67mlLnnmoTlgLxcbiAgICAgIGlmIChyZWNvcmRWYWx1ZSAhPT0gdGhpcy5taWRUZXh0KSB7XG4gICAgICAgIHRoaXMuc2V0VGV4dCh2YWx1ZSlcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgQGF1dG9iaW5kXG4gIGhhbmRsZUJlZm9yZUNoYW5nZShfZWRpdG9yLCBfZGF0YSwgdmFsdWUpIHtcbiAgICB0aGlzLnNldFRleHQodmFsdWUpO1xuICB9XG5cbiAgQGF1dG9iaW5kXG4gIGhhbmRsZUNvZGVNaXJyb3JLZXlEb3duKGNtLCBlKSB7XG4gICAgY29uc3QgeyBvbktleURvd24gPSBub29wLCBvbkVudGVyRG93biA9IG5vb3AgfSA9IHRoaXMucHJvcHM7XG4gICAgc3dpdGNoIChlLmtleUNvZGUpIHtcbiAgICAgIGNhc2UgS2V5Q29kZS5FTlRFUjpcbiAgICAgICAgb25FbnRlckRvd24oZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBLZXlDb2RlLkVTQzpcbiAgICAgICAgY20uZ2V0SW5wdXRGaWVsZCgpLmJsdXIoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgIH1cbiAgICBvbktleURvd24oZSk7XG4gIH1cblxuICBnZXRDb2RlTWlycm9yT3B0aW9ucyhvcHRpb25zOiBFZGl0b3JDb25maWd1cmF0aW9uID0gdGhpcy5wcm9wcy5vcHRpb25zISk6IEVkaXRvckNvbmZpZ3VyYXRpb24ge1xuICAgIHJldHVybiB7IC4uLmRlZmF1bHRDb2RlTWlycm9yT3B0aW9ucywgLi4ub3B0aW9ucyB9O1xuICB9XG5cbiAgZ2V0T3RoZXJQcm9wcygpIHtcbiAgICBjb25zdCBvdGhlclByb3BzID0gb21pdChzdXBlci5nZXRPdGhlclByb3BzKCksIFsnb25DaGFuZ2UnLCAnZm9ybWF0SG90S2V5JywgJ3VuRm9ybWF0SG90S2V5J10pO1xuICAgIG90aGVyUHJvcHMub25LZXlEb3duID0gdGhpcy5oYW5kbGVDb2RlTWlycm9yS2V5RG93bjtcbiAgICByZXR1cm4gb3RoZXJQcm9wcztcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzLCBuZXh0Q29udGV4dCkge1xuICAgIGNvbnN0IHsgb3B0aW9ucyB9ID0gbmV4dFByb3BzO1xuICAgIGlmICghaXNFcXVhbChvcHRpb25zLCB0aGlzLnByb3BzLm9wdGlvbnMpKSB7XG4gICAgICB0aGlzLmNtT3B0aW9ucyA9IHRoaXMuZ2V0Q29kZU1pcnJvck9wdGlvbnMob3B0aW9ucyk7XG4gICAgfVxuICAgIHN1cGVyLmNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzLCBuZXh0Q29udGV4dCk7XG4gIH1cblxuICByZW5kZXJXcmFwcGVyKCk6IFJlYWN0Tm9kZSB7XG4gICAgaWYgKENvZGVNaXJyb3IpIHtcbiAgICAgIHRoaXMuY21PcHRpb25zLnJlYWRPbmx5ID0gdGhpcy5pc0Rpc2FibGVkKCkgPyAnbm9jdXJzb3InIDogdGhpcy5pc1JlYWRPbmx5KCk7XG4gICAgICBjb25zdCB0ZXh0ID0gdGhpcy5nZXRUZXh0Tm9kZSgpO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGRpdiB7Li4udGhpcy5nZXRXcmFwcGVyUHJvcHMoKX0+XG4gICAgICAgICAgPGxhYmVsPlxuICAgICAgICAgICAgPENvZGVNaXJyb3JcbiAgICAgICAgICAgICAgey4uLnRoaXMuZ2V0T3RoZXJQcm9wcygpfVxuICAgICAgICAgICAgICB2YWx1ZT17aXNTdHJpbmcodGV4dCkgPyB0ZXh0IDogdGhpcy5nZXRUZXh0KHRoaXMuZ2V0VmFsdWUoKSl9XG4gICAgICAgICAgICAgIG9wdGlvbnM9e3RoaXMuY21PcHRpb25zfVxuICAgICAgICAgICAgICBvbkJlZm9yZUNoYW5nZT17dGhpcy5oYW5kbGVCZWZvcmVDaGFuZ2V9XG4gICAgICAgICAgICAgIG9uQmx1cj17dGhpcy5oYW5kbGVDb2RlTWlycm9yQmx1cn1cbiAgICAgICAgICAgICAgZWRpdG9yRGlkTW91bnQ9e3RoaXMuaGFuZGxlQ29kZU1pcnJvckRpZE1vdW50fVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIHt0aGlzLnJlbmRlckZsb2F0TGFiZWwoKX1cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgQGFjdGlvblxuICBzZXRUZXh0KHRleHQ/OiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLnRleHQgPSB0ZXh0O1xuICB9XG5cbiAgZ2V0VGV4dE5vZGUoKTogUmVhY3ROb2RlIHtcbiAgICByZXR1cm4gdGhpcy50ZXh0ID09PSB1bmRlZmluZWQgPyAoc3VwZXIuZ2V0VGV4dE5vZGUoKSBhcyBzdHJpbmcpIHx8ICcnIDogdGhpcy50ZXh0O1xuICB9XG5cbiAgcHJvY2Vzc1ZhbHVlKHZhbHVlOiBhbnkpOiBzdHJpbmcge1xuICAgIGNvbnN0IHRleHQgPSBzdXBlci5wcm9jZXNzVmFsdWUodmFsdWUpO1xuICAgIGNvbnN0IHsgZm9ybWF0dGVyIH0gPSB0aGlzLnByb3BzO1xuICAgIHJldHVybiBmb3JtYXR0ZXIgPyBmb3JtYXR0ZXIuZ2V0Rm9ybWF0dGVkKHRleHQpIDogdGV4dDtcbiAgfVxuXG4gIC8qKlxuICAgKiDnvJbovpHlmajlpLHljrvnhKbngrnml7bvvIzosIPnlKjniLbnsbvmlrnms5XvvIzlkIzmraVEYXRhU2V05Lit55qE5YaF5a65XG4gICAqXG4gICAqIEBtZW1iZXJvZiBDb2RlQXJlYVxuICAgKi9cbiAgaGFuZGxlQ29kZU1pcnJvckJsdXIgPSAoY29kZU1pcnJvckluc3RhbmNlOiBJSW5zdGFuY2UpID0+IHtcbiAgICBjb25zdCB7IGZvcm1hdHRlciB9ID0gdGhpcy5wcm9wcztcbiAgICAvLyDmm7TmlrBEYXRhU2V055qE5YC85LmL5YmN77yM5YWI5Y675ou/5Yiw5Y6f5aeL55qEcmF35qC85byPXG4gICAgY29uc3QgY29kZU1pcnJvclRleHQgPSBjb2RlTWlycm9ySW5zdGFuY2UuZ2V0VmFsdWUoKTtcbiAgICBjb25zdCB2YWx1ZSA9IGZvcm1hdHRlciA/IGZvcm1hdHRlci5nZXRSYXcoY29kZU1pcnJvclRleHQpIDogY29kZU1pcnJvclRleHRcbiAgICB0aGlzLm1pZFRleHQgPSB2YWx1ZVxuICAgIHRoaXMuc2V0VmFsdWUodmFsdWUpO1xuICB9O1xuXG4gIC8qKlxuICAgKiDlnKhDb2RlTWlycm9y57yW6L6R5Zmo5a6e5L6L5oyC6L295YmN5re75Yqg6aKd5aSW6YWN572uXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDb2RlQXJlYVxuICAgKi9cbiAgaGFuZGxlQ29kZU1pcnJvckRpZE1vdW50ID0gKGVkaXRvcjogYW55KSA9PiB7XG4gICAgY29uc3QgeyBmb3JtYXR0ZXIsIHN0eWxlLCBmb3JtYXRIb3RLZXksIHVuRm9ybWF0SG90S2V5IH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHsgd2lkdGggPSAnMTAwJScsIGhlaWdodCA9IDEwMCB9ID0gc3R5bGUgfHwge307XG4gICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgIFRhYihjbSkge1xuICAgICAgICBpZiAoY20uc29tZXRoaW5nU2VsZWN0ZWQoKSkge1xuICAgICAgICAgIGNtLmluZGVudFNlbGVjdGlvbignYWRkJyk7IC8vIOaciemAieS4reWGheWuueaXtuaVtOS9k+e8qei/m1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIOS9v+eUqOepuuagvOS7o+abv+e8qei/m1xuICAgICAgICAgIGNvbnN0IHNwYWNlcyA9IEFycmF5KGNtLmdldE9wdGlvbignaW5kZW50VW5pdCcpICsgMSkuam9pbignICcpO1xuICAgICAgICAgIGNtLnJlcGxhY2VTZWxlY3Rpb24oc3BhY2VzKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICB9O1xuICAgIGlmIChmb3JtYXR0ZXIpIHtcbiAgICAgIGlmIChmb3JtYXRIb3RLZXkpIHtcbiAgICAgICAgLy8gZGVmYXVsdDogJ0FsdC1GJ1xuICAgICAgICBvcHRpb25zW2Zvcm1hdEhvdEtleV0gPSBjbSA9PiBjbS5zZXRWYWx1ZShmb3JtYXR0ZXIuZ2V0Rm9ybWF0dGVkKGNtLmdldFZhbHVlKCkpKTtcbiAgICAgIH1cbiAgICAgIGlmICh1bkZvcm1hdEhvdEtleSkge1xuICAgICAgICAvLyBkZWZhdWx0OiAnQWx0LVInXG4gICAgICAgIG9wdGlvbnNbdW5Gb3JtYXRIb3RLZXldID0gY20gPT4gY20uc2V0VmFsdWUoZm9ybWF0dGVyLmdldFJhdyhjbS5nZXRWYWx1ZSgpKSk7XG4gICAgICB9XG4gICAgfVxuICAgIGVkaXRvci5zZXRTaXplKHdpZHRoLCBoZWlnaHQpOyAvLyBkZWZhdWx0IHNpemU6ICgnMTAwJScsIDEwMClcbiAgICBlZGl0b3Iuc2V0T3B0aW9uKCdleHRyYUtleXMnLCBvcHRpb25zKTtcbiAgfTtcbn1cbiJdLCJ2ZXJzaW9uIjozfQ==