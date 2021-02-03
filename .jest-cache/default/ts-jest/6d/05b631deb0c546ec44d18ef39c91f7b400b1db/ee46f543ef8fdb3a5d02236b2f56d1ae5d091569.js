import React, { Component } from 'react';
import classNames from 'classnames';
import LocaleReceiver from '../locale-provider/LocaleReceiver';
import { generateShowHourMinuteSecond } from '../time-picker';
import enUS from './locale/en_US';
import TimePickerPanel from '../rc-components/time-picker/Panel';
import { getPrefixCls } from '../configure';
function getColumns({ showHour, showMinute, showSecond, use12Hours }) {
    let column = 0;
    if (showHour) {
        column += 1;
    }
    if (showMinute) {
        column += 1;
    }
    if (showSecond) {
        column += 1;
    }
    if (use12Hours) {
        column += 1;
    }
    return column;
}
export default function wrapPicker(Picker, defaultFormat) {
    var _a;
    return _a = class PickerWrapper extends Component {
            constructor() {
                super(...arguments);
                this.handleOpenChange = (open) => {
                    const { onOpenChange } = this.props;
                    onOpenChange(open);
                };
                this.handleFocus = (e) => {
                    const { onFocus } = this.props;
                    if (onFocus) {
                        onFocus(e);
                    }
                };
                this.handleBlur = (e) => {
                    const { onBlur } = this.props;
                    if (onBlur) {
                        onBlur(e);
                    }
                };
                this.savePicker = (node) => {
                    this.picker = node;
                };
                this.getDefaultLocale = () => {
                    const { locale } = this.props;
                    const result = {
                        ...enUS,
                        ...locale,
                    };
                    result.lang = {
                        ...result.lang,
                        ...(locale || {}).lang,
                    };
                    return result;
                };
                this.renderPicker = (locale, localeCode) => {
                    const props = this.props;
                    const { prefixCls, inputPrefixCls } = props;
                    const pickerClass = classNames(`${prefixCls}-picker`, {
                        [`${prefixCls}-picker-${props.size}`]: !!props.size,
                    });
                    const pickerInputClass = classNames(`${prefixCls}-picker-input`, inputPrefixCls, {
                        [`${inputPrefixCls}-lg`]: props.size === "large" /* large */,
                        [`${inputPrefixCls}-sm`]: props.size === "small" /* small */,
                        [`${inputPrefixCls}-disabled`]: props.disabled,
                    });
                    const pickerWrapperInputClass = classNames(`${inputPrefixCls}-wrapper`, {
                        [`${inputPrefixCls}-disabled`]: props.disabled,
                        [`${inputPrefixCls}-has-border`]: props.border,
                    });
                    const timeFormat = (props.showTime && props.showTime.format) || 'HH:mm:ss';
                    const rcTimePickerProps = {
                        ...generateShowHourMinuteSecond(timeFormat),
                        format: timeFormat,
                        use12Hours: props.showTime && props.showTime.use12Hours,
                    };
                    const columns = getColumns(rcTimePickerProps);
                    const timePickerCls = `${prefixCls}-time-picker-column-${columns}`;
                    const timePicker = props.showTime ? (React.createElement(TimePickerPanel, Object.assign({}, rcTimePickerProps, props.showTime, { prefixCls: `${prefixCls}-time-picker`, className: timePickerCls, placeholder: locale.timePickerLocale.placeholder, transitionName: "slide-up" }))) : null;
                    return (React.createElement(Picker, Object.assign({}, props, { ref: this.savePicker, pickerClass: pickerClass, pickerInputClass: pickerInputClass, pickerWrapperInputClass: pickerWrapperInputClass, locale: locale, localeCode: localeCode, timePicker: timePicker, onOpenChange: this.handleOpenChange, onFocus: this.handleFocus, onBlur: this.handleBlur })));
                };
            }
            componentDidMount() {
                const { autoFocus, disabled } = this.props;
                if (autoFocus && !disabled) {
                    this.focus();
                }
            }
            focus() {
                this.picker.focus();
            }
            blur() {
                this.picker.blur();
            }
            render() {
                return (React.createElement(LocaleReceiver, { componentName: "DatePicker", defaultLocale: this.getDefaultLocale }, this.renderPicker));
            }
        },
        _a.displayName = 'PickerWrapper',
        _a.defaultProps = {
            format: defaultFormat || 'YYYY-MM-DD',
            transitionName: 'slide-up',
            popupStyle: {},
            onChange() { },
            onOk() { },
            onOpenChange() { },
            locale: {},
            prefixCls: getPrefixCls('calendar'),
            inputPrefixCls: getPrefixCls('input'),
            border: true,
        },
        _a;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMvZGF0ZS1waWNrZXIvd3JhcFBpY2tlci50c3giLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxLQUFLLEVBQUUsRUFBRSxTQUFTLEVBQXFDLE1BQU0sT0FBTyxDQUFDO0FBQzVFLE9BQU8sVUFBVSxNQUFNLFlBQVksQ0FBQztBQUNwQyxPQUFPLGNBQWMsTUFBTSxtQ0FBbUMsQ0FBQztBQUMvRCxPQUFPLEVBQUUsNEJBQTRCLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUM5RCxPQUFPLElBQUksTUFBTSxnQkFBZ0IsQ0FBQztBQUNsQyxPQUFPLGVBQWUsTUFBTSxvQ0FBb0MsQ0FBQztBQUVqRSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBRTVDLFNBQVMsVUFBVSxDQUFDLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFPO0lBQ3ZFLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQztJQUNmLElBQUksUUFBUSxFQUFFO1FBQ1osTUFBTSxJQUFJLENBQUMsQ0FBQztLQUNiO0lBQ0QsSUFBSSxVQUFVLEVBQUU7UUFDZCxNQUFNLElBQUksQ0FBQyxDQUFDO0tBQ2I7SUFDRCxJQUFJLFVBQVUsRUFBRTtRQUNkLE1BQU0sSUFBSSxDQUFDLENBQUM7S0FDYjtJQUNELElBQUksVUFBVSxFQUFFO1FBQ2QsTUFBTSxJQUFJLENBQUMsQ0FBQztLQUNiO0lBQ0QsT0FBTyxNQUFNLENBQUM7QUFDaEIsQ0FBQztBQUVELE1BQU0sQ0FBQyxPQUFPLFVBQVUsVUFBVSxDQUFDLE1BQTJCLEVBQUUsYUFBc0I7O0lBQ3BGLFlBQU8sTUFBTSxhQUFjLFNBQVEsU0FBbUI7WUFBL0M7O2dCQXlCTCxxQkFBZ0IsR0FBRyxDQUFDLElBQWEsRUFBRSxFQUFFO29CQUNuQyxNQUFNLEVBQUUsWUFBWSxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztvQkFDcEMsWUFBWSxDQUFDLElB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QU8sQ0FDTCxvQkFBQyxjQUFjLElBQUMsYUFBYSxFQUFDLFlBQVksRUFBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixJQUM1RSxJQUFJLENBQUMsWUFBWSxDQUNILENBQ2xCLENBQUM7WUFDSixDQUFDO1NBQ0Y7UUEvSFEsY0FBVyxHQUFHLGVBQWdCO1FBRTlCLGVBQVksR0FBRztZQUNwQixNQUFNLEVBQUUsYUFBYSxJQUFJLFlBQVk7WUFDckMsY0FBYyxFQUFFLFVBQVU7WUFDMUIsVUFBVSxFQUFFLEVBQUU7WUFDZCxRQUFRLEtBQUksQ0FBQztZQUNiLElBQUksS0FBSSxDQUFDO1lBQ1QsWUFBWSxLQUFJLENBQUM7WUFDakIsTUFBTSxFQUFFLEVBQUU7WUFDVixTQUFTLEVBQUUsWUFBWSxDQUFDLFVBQVUsQ0FBQztZQUNuQyxjQUFjLEVBQUUsWUFBWSxDQUFDLE9BQU8sQ0FBQztZQUNyQyxNQUFNLEVBQUUsSUFBSTtTQUNaO1dBa0hGO0FBQ0osQ0FBQyIsIm5hbWVzIjpbXSwic291cmNlcyI6WyIvVXNlcnMvaHVpaHVhd2svRG9jdW1lbnRzL29wdC9jaG9lcm9kb24tdWkvY29tcG9uZW50cy9kYXRlLXBpY2tlci93cmFwUGlja2VyLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QsIHsgQ29tcG9uZW50LCBDb21wb25lbnRDbGFzcywgRm9jdXNFdmVudEhhbmRsZXIgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tICdjbGFzc25hbWVzJztcbmltcG9ydCBMb2NhbGVSZWNlaXZlciBmcm9tICcuLi9sb2NhbGUtcHJvdmlkZXIvTG9jYWxlUmVjZWl2ZXInO1xuaW1wb3J0IHsgZ2VuZXJhdGVTaG93SG91ck1pbnV0ZVNlY29uZCB9IGZyb20gJy4uL3RpbWUtcGlja2VyJztcbmltcG9ydCBlblVTIGZyb20gJy4vbG9jYWxlL2VuX1VTJztcbmltcG9ydCBUaW1lUGlja2VyUGFuZWwgZnJvbSAnLi4vcmMtY29tcG9uZW50cy90aW1lLXBpY2tlci9QYW5lbCc7XG5pbXBvcnQgeyBTaXplIH0gZnJvbSAnLi4vX3V0aWwvZW51bSc7XG5pbXBvcnQgeyBnZXRQcmVmaXhDbHMgfSBmcm9tICcuLi9jb25maWd1cmUnO1xuXG5mdW5jdGlvbiBnZXRDb2x1bW5zKHsgc2hvd0hvdXIsIHNob3dNaW51dGUsIHNob3dTZWNvbmQsIHVzZTEySG91cnMgfTogYW55KSB7XG4gIGxldCBjb2x1bW4gPSAwO1xuICBpZiAoc2hvd0hvdXIpIHtcbiAgICBjb2x1bW4gKz0gMTtcbiAgfVxuICBpZiAoc2hvd01pbnV0ZSkge1xuICAgIGNvbHVtbiArPSAxO1xuICB9XG4gIGlmIChzaG93U2Vjb25kKSB7XG4gICAgY29sdW1uICs9IDE7XG4gIH1cbiAgaWYgKHVzZTEySG91cnMpIHtcbiAgICBjb2x1bW4gKz0gMTtcbiAgfVxuICByZXR1cm4gY29sdW1uO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB3cmFwUGlja2VyKFBpY2tlcjogQ29tcG9uZW50Q2xhc3M8YW55PiwgZGVmYXVsdEZvcm1hdD86IHN0cmluZyk6IGFueSB7XG4gIHJldHVybiBjbGFzcyBQaWNrZXJXcmFwcGVyIGV4dGVuZHMgQ29tcG9uZW50PGFueSwgYW55PiB7XG4gICAgc3RhdGljIGRpc3BsYXlOYW1lID0gJ1BpY2tlcldyYXBwZXInO1xuXG4gICAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICAgIGZvcm1hdDogZGVmYXVsdEZvcm1hdCB8fCAnWVlZWS1NTS1ERCcsXG4gICAgICB0cmFuc2l0aW9uTmFtZTogJ3NsaWRlLXVwJyxcbiAgICAgIHBvcHVwU3R5bGU6IHt9LFxuICAgICAgb25DaGFuZ2UoKSB7fSxcbiAgICAgIG9uT2soKSB7fSxcbiAgICAgIG9uT3BlbkNoYW5nZSgpIHt9LFxuICAgICAgbG9jYWxlOiB7fSxcbiAgICAgIHByZWZpeENsczogZ2V0UHJlZml4Q2xzKCdjYWxlbmRhcicpLFxuICAgICAgaW5wdXRQcmVmaXhDbHM6IGdldFByZWZpeENscygnaW5wdXQnKSxcbiAgICAgIGJvcmRlcjogdHJ1ZSxcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBwaWNrZXI6IGFueTtcblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgY29uc3QgeyBhdXRvRm9jdXMsIGRpc2FibGVkIH0gPSB0aGlzLnByb3BzO1xuICAgICAgaWYgKGF1dG9Gb2N1cyAmJiAhZGlzYWJsZWQpIHtcbiAgICAgICAgdGhpcy5mb2N1cygpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGhhbmRsZU9wZW5DaGFuZ2UgPSAob3BlbjogYm9vbGVhbikgPT4ge1xuICAgICAgY29uc3QgeyBvbk9wZW5DaGFuZ2UgfSA9IHRoaXMucHJvcHM7XG4gICAgICBvbk9wZW5DaGFuZ2Uob3Blbik7XG4gICAgfTtcblxuICAgIGhhbmRsZUZvY3VzID0gKGU6IEZvY3VzRXZlbnRIYW5kbGVyPEhUTUxJbnB1dEVsZW1lbnQ+KSA9PiB7XG4gICAgICBjb25zdCB7IG9uRm9jdXMgfSA9IHRoaXMucHJvcHM7XG4gICAgICBpZiAob25Gb2N1cykge1xuICAgICAgICBvbkZvY3VzKGUpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBoYW5kbGVCbHVyID0gKGU6IEZvY3VzRXZlbnRIYW5kbGVyPEhUTUxJbnB1dEVsZW1lbnQ+KSA9PiB7XG4gICAgICBjb25zdCB7IG9uQmx1ciB9ID0gdGhpcy5wcm9wcztcbiAgICAgIGlmIChvbkJsdXIpIHtcbiAgICAgICAgb25CbHVyKGUpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBmb2N1cygpIHtcbiAgICAgIHRoaXMucGlja2VyLmZvY3VzKCk7XG4gICAgfVxuXG4gICAgYmx1cigpIHtcbiAgICAgIHRoaXMucGlja2VyLmJsdXIoKTtcbiAgICB9XG5cbiAgICBzYXZlUGlja2VyID0gKG5vZGU6IGFueSkgPT4ge1xuICAgICAgdGhpcy5waWNrZXIgPSBub2RlO1xuICAgIH07XG5cbiAgICBnZXREZWZhdWx0TG9jYWxlID0gKCkgPT4ge1xuICAgICAgY29uc3QgeyBsb2NhbGUgfSA9IHRoaXMucHJvcHM7XG4gICAgICBjb25zdCByZXN1bHQgPSB7XG4gICAgICAgIC4uLmVuVVMsXG4gICAgICAgIC4uLmxvY2FsZSxcbiAgICAgIH07XG4gICAgICByZXN1bHQubGFuZyA9IHtcbiAgICAgICAgLi4ucmVzdWx0LmxhbmcsXG4gICAgICAgIC4uLihsb2NhbGUgfHwge30pLmxhbmcsXG4gICAgICB9O1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuXG4gICAgcmVuZGVyUGlja2VyID0gKGxvY2FsZTogYW55LCBsb2NhbGVDb2RlOiBzdHJpbmcpID0+IHtcbiAgICAgIGNvbnN0IHByb3BzID0gdGhpcy5wcm9wcztcbiAgICAgIGNvbnN0IHsgcHJlZml4Q2xzLCBpbnB1dFByZWZpeENscyB9ID0gcHJvcHM7XG4gICAgICBjb25zdCBwaWNrZXJDbGFzcyA9IGNsYXNzTmFtZXMoYCR7cHJlZml4Q2xzfS1waWNrZXJgLCB7XG4gICAgICAgIFtgJHtwcmVmaXhDbHN9LXBpY2tlci0ke3Byb3BzLnNpemV9YF06ICEhcHJvcHMuc2l6ZSxcbiAgICAgIH0pO1xuICAgICAgY29uc3QgcGlja2VySW5wdXRDbGFzcyA9IGNsYXNzTmFtZXMoYCR7cHJlZml4Q2xzfS1waWNrZXItaW5wdXRgLCBpbnB1dFByZWZpeENscywge1xuICAgICAgICBbYCR7aW5wdXRQcmVmaXhDbHN9LWxnYF06IHByb3BzLnNpemUgPT09IFNpemUubGFyZ2UsXG4gICAgICAgIFtgJHtpbnB1dFByZWZpeENsc30tc21gXTogcHJvcHMuc2l6ZSA9PT0gU2l6ZS5zbWFsbCxcbiAgICAgICAgW2Ake2lucHV0UHJlZml4Q2xzfS1kaXNhYmxlZGBdOiBwcm9wcy5kaXNhYmxlZCxcbiAgICAgIH0pO1xuICAgICAgY29uc3QgcGlja2VyV3JhcHBlcklucHV0Q2xhc3MgPSBjbGFzc05hbWVzKGAke2lucHV0UHJlZml4Q2xzfS13cmFwcGVyYCwge1xuICAgICAgICBbYCR7aW5wdXRQcmVmaXhDbHN9LWRpc2FibGVkYF06IHByb3BzLmRpc2FibGVkLFxuICAgICAgICBbYCR7aW5wdXRQcmVmaXhDbHN9LWhhcy1ib3JkZXJgXTogcHJvcHMuYm9yZGVyLFxuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IHRpbWVGb3JtYXQgPSAocHJvcHMuc2hvd1RpbWUgJiYgcHJvcHMuc2hvd1RpbWUuZm9ybWF0KSB8fCAnSEg6bW06c3MnO1xuICAgICAgY29uc3QgcmNUaW1lUGlja2VyUHJvcHMgPSB7XG4gICAgICAgIC4uLmdlbmVyYXRlU2hvd0hvdXJNaW51dGVTZWNvbmQodGltZUZvcm1hdCksXG4gICAgICAgIGZvcm1hdDogdGltZUZvcm1hdCxcbiAgICAgICAgdXNlMTJIb3VyczogcHJvcHMuc2hvd1RpbWUgJiYgcHJvcHMuc2hvd1RpbWUudXNlMTJIb3VycyxcbiAgICAgIH07XG4gICAgICBjb25zdCBjb2x1bW5zID0gZ2V0Q29sdW1ucyhyY1RpbWVQaWNrZXJQcm9wcyk7XG4gICAgICBjb25zdCB0aW1lUGlja2VyQ2xzID0gYCR7cHJlZml4Q2xzfS10aW1lLXBpY2tlci1jb2x1bW4tJHtjb2x1bW5zfWA7XG4gICAgICBjb25zdCB0aW1lUGlja2VyID0gcHJvcHMuc2hvd1RpbWUgPyAoXG4gICAgICAgIDxUaW1lUGlja2VyUGFuZWxcbiAgICAgICAgICB7Li4ucmNUaW1lUGlja2VyUHJvcHN9XG4gICAgICAgICAgey4uLnByb3BzLnNob3dUaW1lfVxuICAgICAgICAgIHByZWZpeENscz17YCR7cHJlZml4Q2xzfS10aW1lLXBpY2tlcmB9XG4gICAgICAgICAgY2xhc3NOYW1lPXt0aW1lUGlja2VyQ2xzfVxuICAgICAgICAgIHBsYWNlaG9sZGVyPXtsb2NhbGUudGltZVBpY2tlckxvY2FsZS5wbGFjZWhvbGRlcn1cbiAgICAgICAgICB0cmFuc2l0aW9uTmFtZT1cInNsaWRlLXVwXCJcbiAgICAgICAgLz5cbiAgICAgICkgOiBudWxsO1xuXG4gICAgICByZXR1cm4gKFxuICAgICAgICA8UGlja2VyXG4gICAgICAgICAgey4uLnByb3BzfVxuICAgICAgICAgIHJlZj17dGhpcy5zYXZlUGlja2VyfVxuICAgICAgICAgIHBpY2tlckNsYXNzPXtwaWNrZXJDbGFzc31cbiAgICAgICAgICBwaWNrZXJJbnB1dENsYXNzPXtwaWNrZXJJbnB1dENsYXNzfVxuICAgICAgICAgIHBpY2tlcldyYXBwZXJJbnB1dENsYXNzPXtwaWNrZXJXcmFwcGVySW5wdXRDbGFzc31cbiAgICAgICAgICBsb2NhbGU9e2xvY2FsZX1cbiAgICAgICAgICBsb2NhbGVDb2RlPXtsb2NhbGVDb2RlfVxuICAgICAgICAgIHRpbWVQaWNrZXI9e3RpbWVQaWNrZXJ9XG4gICAgICAgICAgb25PcGVuQ2hhbmdlPXt0aGlzLmhhbmRsZU9wZW5DaGFuZ2V9XG4gICAgICAgICAgb25Gb2N1cz17dGhpcy5oYW5kbGVGb2N1c31cbiAgICAgICAgICBvbkJsdXI9e3RoaXMuaGFuZGxlQmx1cn1cbiAgICAgICAgLz5cbiAgICAgICk7XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxMb2NhbGVSZWNlaXZlciBjb21wb25lbnROYW1lPVwiRGF0ZVBpY2tlclwiIGRlZmF1bHRMb2NhbGU9e3RoaXMuZ2V0RGVmYXVsdExvY2FsZX0+XG4gICAgICAgICAge3RoaXMucmVuZGVyUGlja2VyfVxuICAgICAgICA8L0xvY2FsZVJlY2VpdmVyPlxuICAgICAgKTtcbiAgICB9XG4gIH07XG59XG4iXSwidmVyc2lvbiI6M30=