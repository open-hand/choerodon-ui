import { __decorate } from "tslib";
import React from 'react';
import { observer } from 'mobx-react';
import { action, observable } from 'mobx';
import { getConfig } from 'choerodon-ui/lib/configure';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import { TextField } from '../text-field/TextField';
import Icon from '../icon';
import { open } from '../modal-container/ModalContainer';
import IntlList from './IntlList';
import localeContext, { $l } from '../locale-context';
import Progress from '../progress';
import message from '../message';
import exception from '../_util/exception';
import autobind from '../_util/autobind';
import { stopEvent } from '../_util/EventManager';
import isSame from '../_util/isSame';
let IntlField = class IntlField extends TextField {
    constructor() {
        super(...arguments);
        this.openModal = async () => {
            if (!this.modal) {
                const { modalProps, maxLengths } = this.props;
                const { record, lang, name, element } = this;
                const maxLengthList = { ...maxLengths, [lang]: element.maxLength };
                if (record) {
                    this.setLoading(true);
                    try {
                        if (element && !isSame(this.getValue(), element.value)) {
                            this.syncValueOnBlur(element.value);
                        }
                        await record.tls(name);
                    }
                    catch (err) {
                        message.error(exception(err));
                        return;
                    }
                    finally {
                        this.setLoading(false);
                    }
                }
                this.storeLocales();
                this.modal = open({
                    title: $l('IntlField', 'modal_title'),
                    children: React.createElement(IntlList, { record: record, name: name, lang: lang, maxLengths: maxLengthList }),
                    onClose: this.handleIntlListClose,
                    onOk: this.handleIntlListOk,
                    onCancel: this.handleIntlListCancel,
                    destroyOnClose: true,
                    ...modalProps,
                });
            }
        };
        this.handleIntlListClose = async () => {
            delete this.modal;
            this.focus();
        };
    }
    setLoading(loading) {
        this.loading = loading;
    }
    async handleIntlListOk() {
        const { supports } = localeContext;
        const languages = Object.keys(supports);
        const { record, name, field } = this;
        if (record && field) {
            const tlsKey = getConfig('tlsKey');
            return (await Promise.all(languages.map(language => {
                const intlField = record.getField(`${tlsKey}.${name}.${language}`);
                return intlField ? intlField.checkValidity() : true;
            }))).every(Boolean);
        }
    }
    async handleIntlListCancel() {
        const { name, record } = this;
        if (record) {
            const tlsKey = getConfig('tlsKey');
            record.set(`${tlsKey}.${name}`, this.locales);
        }
    }
    handleKeyDown(e) {
        if (e.keyCode === KeyCode.DOWN) {
            stopEvent(e);
            this.openModal();
        }
        super.handleKeyDown(e);
    }
    handleBlur(e) {
        if (this.modal) {
            e.preventDefault();
        }
        super.handleBlur(e);
    }
    storeLocales() {
        const { name, record } = this;
        if (record) {
            const tlsKey = getConfig('tlsKey');
            this.locales = { ...record.get(`${tlsKey}.${name}`) };
        }
    }
    getSuffix() {
        const { suffix } = this.props;
        return this.wrapperSuffix(this.loading ? (React.createElement(Progress, { size: "small" /* small */, type: "loading" /* loading */ })) : (suffix || React.createElement(Icon, { type: "language" })), {
            onClick: this.isDisabled() || this.isReadOnly() ? undefined : this.openModal,
        });
    }
    componentWillUnmount() {
        if (this.modal) {
            this.modal.close();
        }
    }
};
IntlField.displayName = 'IntlField';
__decorate([
    observable
], IntlField.prototype, "loading", void 0);
__decorate([
    action
], IntlField.prototype, "setLoading", null);
__decorate([
    autobind
], IntlField.prototype, "handleIntlListOk", null);
__decorate([
    autobind
], IntlField.prototype, "handleIntlListCancel", null);
__decorate([
    autobind
], IntlField.prototype, "handleKeyDown", null);
__decorate([
    autobind
], IntlField.prototype, "handleBlur", null);
IntlField = __decorate([
    observer
], IntlField);
export default IntlField;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL2ludGwtZmllbGQvSW50bEZpZWxkLnRzeCIsIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxLQUFvQixNQUFNLE9BQU8sQ0FBQztBQUN6QyxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQ3RDLE9BQU8sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBRTFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUN2RCxPQUFPLE9BQU8sTUFBTSxnQ0FBZ0MsQ0FBQztBQUNyRCxPQUFPLEVBQUUsU0FBUyxFQUFrQixNQUFNLHlCQUF5QixDQUFDO0FBQ3BFLE9BQU8sSUFBSSxNQUFNLFNBQVMsQ0FBQztBQUMzQixPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFDekQsT0FBTyxRQUFRLE1BQU0sWUFBWSxDQUFDO0FBRWxDLE9BQU8sYUFBYSxFQUFFLEVBQUUsRUFBRSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDdEQsT0FBTyxRQUFRLE1BQU0sYUFBYSxDQUFDO0FBRW5DLE9BQU8sT0FBTyxNQUFNLFlBQVksQ0FBQztBQUNqQyxPQUFPLFNBQVMsTUFBTSxvQkFBb0IsQ0FBQztBQUMzQyxPQUFPLFFBQVEsTUFBTSxtQkFBbUIsQ0FBQztBQUN6QyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDbEQsT0FBTyxNQUFNLE1BQU0saUJBQWlCLENBQUM7QUFRckMsSUFBcUIsU0FBUyxHQUE5QixNQUFxQixTQUFVLFNBQVEsU0FBeUI7SUFBaEU7O1FBU0UsY0FBUyxHQUFHLEtBQUssSUFBSSxFQUFFO1lBQ3JCLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFO2dCQUNmLE1BQU0sRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztnQkFDOUMsTUFB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QkFBMEIsQ0FDM0QsQ0FBQyxDQUFDLENBQUMsQ0FDRixNQUFNLElBQUksb0JBQUMsSUFBSSxJQUFDLElBQUksRUFBQyxVQUFVLEdBQUcsQ0FDbkMsRUFDRDtZQUNFLE9BQU8sRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTO1NBQzdFLENBQ0YsQ0FBQztJQUNKLENBQUM7SUFFRCxvQkFBb0I7UUFDbEIsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO1lBQ2QsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztTQUNwQjtJQUNILENBQUM7Q0FDRixDQUFBO0FBeEhRLHFCQUFXLEdBQUcsV0FBVyxDQUFDO0FBTXJCO0lBQVgsVUFBVTswQ0FBbUI7QUFvQzlCO0lBREMsTUFBTTsyQ0FHTjtBQVFEO0lBREMsUUFBUTtpREFjUjtBQUdEO0lBREMsUUFBUTtxREFPUjtBQUdEO0lBREMsUUFBUTs4Q0FPUjtBQUdEO0lBREMsUUFBUTsyQ0FNUjtBQTVGa0IsU0FBUztJQUQ3QixRQUFRO0dBQ1ksU0FBUyxDQXlIN0I7ZUF6SG9CLFNBQVMiLCJuYW1lcyI6W10sInNvdXJjZXMiOlsiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL2ludGwtZmllbGQvSW50bEZpZWxkLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QsIHsgUmVhY3ROb2RlIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgb2JzZXJ2ZXIgfSBmcm9tICdtb2J4LXJlYWN0JztcbmltcG9ydCB7IGFjdGlvbiwgb2JzZXJ2YWJsZSB9IGZyb20gJ21vYngnO1xuaW1wb3J0IHsgUHJvZ3Jlc3NUeXBlIH0gZnJvbSAnY2hvZXJvZG9uLXVpL2xpYi9wcm9ncmVzcy9lbnVtJztcbmltcG9ydCB7IGdldENvbmZpZyB9IGZyb20gJ2Nob2Vyb2Rvbi11aS9saWIvY29uZmlndXJlJztcbmltcG9ydCBLZXlDb2RlIGZyb20gJ2Nob2Vyb2Rvbi11aS9saWIvX3V0aWwvS2V5Q29kZSc7XG5pbXBvcnQgeyBUZXh0RmllbGQsIFRleHRGaWVsZFByb3BzIH0gZnJvbSAnLi4vdGV4dC1maWVsZC9UZXh0RmllbGQnO1xuaW1wb3J0IEljb24gZnJvbSAnLi4vaWNvbic7XG5pbXBvcnQgeyBvcGVuIH0gZnJvbSAnLi4vbW9kYWwtY29udGFpbmVyL01vZGFsQ29udGFpbmVyJztcbmltcG9ydCBJbnRsTGlzdCBmcm9tICcuL0ludGxMaXN0JztcbmltcG9ydCB7IE1vZGFsUHJvcHMgfSBmcm9tICcuLi9tb2RhbC9Nb2RhbCc7XG5pbXBvcnQgbG9jYWxlQ29udGV4dCwgeyAkbCB9IGZyb20gJy4uL2xvY2FsZS1jb250ZXh0JztcbmltcG9ydCBQcm9ncmVzcyBmcm9tICcuLi9wcm9ncmVzcyc7XG5pbXBvcnQgeyBTaXplIH0gZnJvbSAnLi4vY29yZS9lbnVtJztcbmltcG9ydCBtZXNzYWdlIGZyb20gJy4uL21lc3NhZ2UnO1xuaW1wb3J0IGV4Y2VwdGlvbiBmcm9tICcuLi9fdXRpbC9leGNlcHRpb24nO1xuaW1wb3J0IGF1dG9iaW5kIGZyb20gJy4uL191dGlsL2F1dG9iaW5kJztcbmltcG9ydCB7IHN0b3BFdmVudCB9IGZyb20gJy4uL191dGlsL0V2ZW50TWFuYWdlcic7XG5pbXBvcnQgaXNTYW1lIGZyb20gJy4uL191dGlsL2lzU2FtZSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgSW50bEZpZWxkUHJvcHMgZXh0ZW5kcyBUZXh0RmllbGRQcm9wcyB7XG4gIG1vZGFsUHJvcHM/OiBNb2RhbFByb3BzO1xuICBtYXhMZW5ndGhzPzogb2JqZWN0O1xufVxuXG5Ab2JzZXJ2ZXJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEludGxGaWVsZCBleHRlbmRzIFRleHRGaWVsZDxJbnRsRmllbGRQcm9wcz4ge1xuICBzdGF0aWMgZGlzcGxheU5hbWUgPSAnSW50bEZpZWxkJztcblxuICBtb2RhbDtcblxuICBsb2NhbGVzPzogb2JqZWN0O1xuXG4gIEBvYnNlcnZhYmxlIGxvYWRpbmc/OiBib29sZWFuO1xuXG4gIG9wZW5Nb2RhbCA9IGFzeW5jICgpID0+IHtcbiAgICBpZiAoIXRoaXMubW9kYWwpIHtcbiAgICAgIGNvbnN0IHsgbW9kYWxQcm9wcywgbWF4TGVuZ3RocyB9ID0gdGhpcy5wcm9wcztcbiAgICAgIGNvbnN0IHsgcmVjb3JkLCBsYW5nLCBuYW1lLCBlbGVtZW50IH0gPSB0aGlzO1xuICAgICAgY29uc3QgbWF4TGVuZ3RoTGlzdCA9IHsgLi4ubWF4TGVuZ3RocywgW2xhbmddOiBlbGVtZW50Lm1heExlbmd0aCB9O1xuICAgICAgaWYgKHJlY29yZCkge1xuICAgICAgICB0aGlzLnNldExvYWRpbmcodHJ1ZSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaWYgKGVsZW1lbnQgJiYgIWlzU2FtZSh0aGlzLmdldFZhbHVlKCksIGVsZW1lbnQudmFsdWUpKSB7XG4gICAgICAgICAgICB0aGlzLnN5bmNWYWx1ZU9uQmx1cihlbGVtZW50LnZhbHVlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYXdhaXQgcmVjb3JkLnRscyhuYW1lKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgbWVzc2FnZS5lcnJvcihleGNlcHRpb24oZXJyKSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgIHRoaXMuc2V0TG9hZGluZyhmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuc3RvcmVMb2NhbGVzKCk7XG5cbiAgICAgIHRoaXMubW9kYWwgPSBvcGVuKHtcbiAgICAgICAgdGl0bGU6ICRsKCdJbnRsRmllbGQnLCAnbW9kYWxfdGl0bGUnKSxcbiAgICAgICAgY2hpbGRyZW46IDxJbnRsTGlzdCByZWNvcmQ9e3JlY29yZH0gbmFtZT17bmFtZX0gbGFuZz17bGFuZ30gbWF4TGVuZ3Rocz17bWF4TGVuZ3RoTGlzdH0gLz4sXG4gICAgICAgIG9uQ2xvc2U6IHRoaXMuaGFuZGxlSW50bExpc3RDbG9zZSxcbiAgICAgICAgb25PazogdGhpcy5oYW5kbGVJbnRsTGlzdE9rLFxuICAgICAgICBvbkNhbmNlbDogdGhpcy5oYW5kbGVJbnRsTGlzdENhbmNlbCxcbiAgICAgICAgZGVzdHJveU9uQ2xvc2U6IHRydWUsXG4gICAgICAgIC4uLm1vZGFsUHJvcHMsXG4gICAgICB9IGFzIE1vZGFsUHJvcHMgJiB7IGNoaWxkcmVuIH0pO1xuICAgIH1cbiAgfTtcblxuICBAYWN0aW9uXG4gIHNldExvYWRpbmcobG9hZGluZykge1xuICAgIHRoaXMubG9hZGluZyA9IGxvYWRpbmc7XG4gIH1cblxuICBoYW5kbGVJbnRsTGlzdENsb3NlID0gYXN5bmMgKCkgPT4ge1xuICAgIGRlbGV0ZSB0aGlzLm1vZGFsO1xuICAgIHRoaXMuZm9jdXMoKTtcbiAgfTtcblxuICBAYXV0b2JpbmRcbiAgYXN5bmMgaGFuZGxlSW50bExpc3RPaygpIHtcbiAgICBjb25zdCB7IHN1cHBvcnRzIH0gPSBsb2NhbGVDb250ZXh0O1xuICAgIGNvbnN0IGxhbmd1YWdlcyA9IE9iamVjdC5rZXlzKHN1cHBvcnRzKTtcbiAgICBjb25zdCB7IHJlY29yZCwgbmFtZSwgZmllbGQgfSA9IHRoaXM7XG4gICAgaWYgKHJlY29yZCAmJiBmaWVsZCkge1xuICAgICAgY29uc3QgdGxzS2V5ID0gZ2V0Q29uZmlnKCd0bHNLZXknKTtcbiAgICAgIHJldHVybiAoYXdhaXQgUHJvbWlzZS5hbGwoXG4gICAgICAgIGxhbmd1YWdlcy5tYXAobGFuZ3VhZ2UgPT4ge1xuICAgICAgICAgIGNvbnN0IGludGxGaWVsZCA9IHJlY29yZC5nZXRGaWVsZChgJHt0bHNLZXl9LiR7bmFtZX0uJHtsYW5ndWFnZX1gKTtcbiAgICAgICAgICByZXR1cm4gaW50bEZpZWxkID8gaW50bEZpZWxkLmNoZWNrVmFsaWRpdHkoKSA6IHRydWU7XG4gICAgICAgIH0pLFxuICAgICAgKSkuZXZlcnkoQm9vbGVhbik7XG4gICAgfVxuICB9XG5cbiAgQGF1dG9iaW5kXG4gIGFzeW5jIGhhbmRsZUludGxMaXN0Q2FuY2VsKCkge1xuICAgIGNvbnN0IHsgbmFtZSwgcmVjb3JkIH0gPSB0aGlzO1xuICAgIGlmIChyZWNvcmQpIHtcbiAgICAgIGNvbnN0IHRsc0tleSA9IGdldENvbmZpZygndGxzS2V5Jyk7XG4gICAgICByZWNvcmQuc2V0KGAke3Rsc0tleX0uJHtuYW1lfWAsIHRoaXMubG9jYWxlcyk7XG4gICAgfVxuICB9XG5cbiAgQGF1dG9iaW5kXG4gIGhhbmRsZUtleURvd24oZSkge1xuICAgIGlmIChlLmtleUNvZGUgPT09IEtleUNvZGUuRE9XTikge1xuICAgICAgc3RvcEV2ZW50KGUpO1xuICAgICAgdGhpcy5vcGVuTW9kYWwoKTtcbiAgICB9XG4gICAgc3VwZXIuaGFuZGxlS2V5RG93bihlKTtcbiAgfVxuXG4gIEBhdXRvYmluZFxuICBoYW5kbGVCbHVyKGUpIHtcbiAgICBpZiAodGhpcy5tb2RhbCkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cbiAgICBzdXBlci5oYW5kbGVCbHVyKGUpO1xuICB9XG5cbiAgc3RvcmVMb2NhbGVzKCkge1xuICAgIGNvbnN0IHsgbmFtZSwgcmVjb3JkIH0gPSB0aGlzO1xuICAgIGlmIChyZWNvcmQpIHtcbiAgICAgIGNvbnN0IHRsc0tleSA9IGdldENvbmZpZygndGxzS2V5Jyk7XG4gICAgICB0aGlzLmxvY2FsZXMgPSB7IC4uLnJlY29yZC5nZXQoYCR7dGxzS2V5fS4ke25hbWV9YCkgfTtcbiAgICB9XG4gIH1cblxuICBnZXRTdWZmaXgoKTogUmVhY3ROb2RlIHtcbiAgICBjb25zdCB7IHN1ZmZpeCB9ID0gdGhpcy5wcm9wcztcbiAgICByZXR1cm4gdGhpcy53cmFwcGVyU3VmZml4KFxuICAgICAgdGhpcy5sb2FkaW5nID8gKFxuICAgICAgICA8UHJvZ3Jlc3Mgc2l6ZT17U2l6ZS5zbWFsbH0gdHlwZT17UHJvZ3Jlc3NUeXBlLmxvYWRpbmd9IC8+XG4gICAgICApIDogKFxuICAgICAgICBzdWZmaXggfHwgPEljb24gdHlwZT1cImxhbmd1YWdlXCIgLz5cbiAgICAgICksXG4gICAgICB7XG4gICAgICAgIG9uQ2xpY2s6IHRoaXMuaXNEaXNhYmxlZCgpIHx8IHRoaXMuaXNSZWFkT25seSgpID8gdW5kZWZpbmVkIDogdGhpcy5vcGVuTW9kYWwsXG4gICAgICB9LFxuICAgICk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICBpZiAodGhpcy5tb2RhbCkge1xuICAgICAgdGhpcy5tb2RhbC5jbG9zZSgpO1xuICAgIH1cbiAgfVxufVxuIl0sInZlcnNpb24iOjN9