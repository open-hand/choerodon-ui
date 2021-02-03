import { __decorate } from "tslib";
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { action, observable } from 'mobx';
import { getProPrefixCls } from 'choerodon-ui/lib/configure';
import Icon from 'choerodon-ui/lib/icon';
import Button from '../../button';
import TableContext from '../TableContext';
import Form from '../../form';
import { $l } from '../../locale-context';
import autobind from '../../_util/autobind';
import TableButtons from './TableButtons';
let TableProfessionalBar = class TableProfessionalBar extends Component {
    constructor() {
        super(...arguments);
        this.openMore = (fields) => {
            if (this.moreFields && this.moreFields.length) {
                this.moreFields = [];
            }
            else {
                this.moreFields = fields;
            }
            return this.moreFields;
        };
    }
    handleFieldEnter() {
        this.handleQuery();
    }
    async handleQuery() {
        const { dataSet, queryDataSet } = this.props;
        if (await queryDataSet?.validate()) {
            dataSet.query();
        }
    }
    getResetButton() {
        return (React.createElement(Button, { funcType: "raised" /* raised */, onClick: this.handleQueryReset }, $l('Table', 'reset_button')));
    }
    getMoreFieldsButton(fields) {
        if (fields.length) {
            return (React.createElement(Button, { funcType: "raised" /* raised */, onClick: () => this.openMore(fields) },
                $l('Table', 'more'),
                this.moreFields && this.moreFields.length ? React.createElement(Icon, { type: 'expand_less' }) : React.createElement(Icon, { type: 'expand_more' })));
        }
    }
    getQueryBar() {
        const { prefixCls, queryFieldsLimit, queryFields, queryDataSet, queryBarProps } = this.props;
        if (queryDataSet && queryFields.length) {
            const currentFields = (React.createElement(Form, Object.assign({ useColon: false, dataSet: queryDataSet, columns: queryFieldsLimit, labelLayout: "horizontal" /* horizontal */ }, queryBarProps),
                queryFields.slice(0, queryFieldsLimit),
                this.moreFields));
            const moreFields = queryFields.slice(queryFieldsLimit);
            const moreFieldsButton = this.getMoreFieldsButton(moreFields);
            return (React.createElement("div", { key: "query_bar", className: `${prefixCls}-professional-query-bar` },
                currentFields,
                React.createElement("span", { className: `${prefixCls}-professional-query-bar-button` },
                    moreFieldsButton,
                    this.getResetButton(),
                    React.createElement(Button, { color: "primary" /* primary */, onClick: this.handleQuery }, $l('Table', 'query_button')))));
        }
    }
    handleQueryReset() {
        const { queryDataSet } = this.props;
        if (queryDataSet) {
            const { current } = queryDataSet;
            if (current) {
                current.reset();
            }
            this.handleQuery();
        }
    }
    render() {
        const { prefixCls, buttons } = this.props;
        const queryBar = this.getQueryBar();
        const tableButtons = buttons.length ? (React.createElement("div", { key: "professional_toolbar", className: `${prefixCls}-professional-toolbar` },
            React.createElement(TableButtons, { key: "toolbar", prefixCls: prefixCls, buttons: buttons }))) : null;
        return [queryBar, tableButtons];
    }
};
TableProfessionalBar.contextType = TableContext;
TableProfessionalBar.defaultProps = {
    prefixCls: getProPrefixCls('table'),
    queryFieldsLimit: 3,
};
__decorate([
    observable
], TableProfessionalBar.prototype, "moreFields", void 0);
__decorate([
    autobind
], TableProfessionalBar.prototype, "handleFieldEnter", null);
__decorate([
    autobind
], TableProfessionalBar.prototype, "handleQuery", null);
__decorate([
    action
], TableProfessionalBar.prototype, "openMore", void 0);
__decorate([
    autobind
], TableProfessionalBar.prototype, "handleQueryReset", null);
TableProfessionalBar = __decorate([
    observer
], TableProfessionalBar);
export default TableProfessionalBar;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL3RhYmxlL3F1ZXJ5LWJhci9UYWJsZVByb2Zlc3Npb25hbEJhci50c3giLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sS0FBSyxFQUFFLEVBQUUsU0FBUyxFQUEyQixNQUFNLE9BQU8sQ0FBQztBQUNsRSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQ3RDLE9BQU8sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzFDLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUM3RCxPQUFPLElBQUksTUFBTSx1QkFBdUIsQ0FBQztBQUd6QyxPQUFPLE1BQU0sTUFBTSxjQUFjLENBQUM7QUFDbEMsT0FBTyxZQUFZLE1BQU0saUJBQWlCLENBQUM7QUFJM0MsT0FBTyxJQUFJLE1BQU0sWUFBWSxDQUFDO0FBRTlCLE9BQU8sRUFBRSxFQUFFLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUMxQyxPQUFPLFFBQVEsTUFBTSxzQkFBc0IsQ0FBQztBQUM1QyxPQUFPLFlBQVksTUFBTSxnQkFBZ0IsQ0FBQztBQWExQyxJQUFxQixvQkFBb0IsR0FBekMsTUFBcUIsb0JBQXFCLFNBQVEsU0FBb0M7SUFBdEY7O1FBd0JFLGFBQVEsR0FBRyxDQUFDLE1BQWUsRUFBRSxFQUFFO1lBQzdCLElBQUksSUFBSSxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRTtnQkFDN0MsSUFBSSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUM7YUFDdEI7aUJBQU07Z0JBQ0wsSUFBSSxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUM7YUFDMUI7WUFDRCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUM7UUFDekIsQ0FBQyxDQUFDO0lBa0ZKLENBQUM7SUF0R0MsZ0JBQWdCO1FBQ2QsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3JCLENBQUM7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QyxNQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUNwQyw2QkFBSyxHQUFHLEVBQUMsc0JBQXNCLEVBQUMsU0FBUyxFQUFFLEdBQUcsU0FBUyx1QkFBdUI7WUFDNUUsb0JBQUMsWUFBWSxJQUFDLEdBQUcsRUFBQyxTQUFTLEVBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsT0FBTyxHQUFJLENBQ2xFLENBQ1AsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBRVQsT0FBTyxDQUFDLFFBQVEsRUFBRSxZQUFZLENBQUMsQ0FBQztJQUNsQyxDQUFDO0NBQ0YsQ0FBQTtBQWhIUSxnQ0FBVyxHQUFHLFlBQVksQ0FBQztBQUUzQixpQ0FBWSxHQUFHO0lBQ3BCLFNBQVMsRUFBRSxlQUFlLENBQUMsT0FBTyxDQUFDO0lBQ25DLGdCQUFnQixFQUFFLENBQUM7Q0FDcEIsQ0FBQztBQUVVO0lBQVgsVUFBVTt3REFBcUI7QUFHaEM7SUFEQyxRQUFROzREQUdSO0FBR0Q7SUFEQyxRQUFRO3VEQU1SO0FBR0Q7SUFEQyxNQUFNO3NEQVFMO0FBNERGO0lBREMsUUFBUTs0REFVUjtBQXBHa0Isb0JBQW9CO0lBRHhDLFFBQVE7R0FDWSxvQkFBb0IsQ0FpSHhDO2VBakhvQixvQkFBb0IiLCJuYW1lcyI6W10sInNvdXJjZXMiOlsiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL3RhYmxlL3F1ZXJ5LWJhci9UYWJsZVByb2Zlc3Npb25hbEJhci50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0LCB7IENvbXBvbmVudCwgUmVhY3RFbGVtZW50LCBSZWFjdE5vZGUgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBvYnNlcnZlciB9IGZyb20gJ21vYngtcmVhY3QnO1xuaW1wb3J0IHsgYWN0aW9uLCBvYnNlcnZhYmxlIH0gZnJvbSAnbW9ieCc7XG5pbXBvcnQgeyBnZXRQcm9QcmVmaXhDbHMgfSBmcm9tICdjaG9lcm9kb24tdWkvbGliL2NvbmZpZ3VyZSc7XG5pbXBvcnQgSWNvbiBmcm9tICdjaG9lcm9kb24tdWkvbGliL2ljb24nO1xuaW1wb3J0IEZpZWxkIGZyb20gJy4uLy4uL2RhdGEtc2V0L0ZpZWxkJztcbmltcG9ydCBEYXRhU2V0IGZyb20gJy4uLy4uL2RhdGEtc2V0JztcbmltcG9ydCBCdXR0b24gZnJvbSAnLi4vLi4vYnV0dG9uJztcbmltcG9ydCBUYWJsZUNvbnRleHQgZnJvbSAnLi4vVGFibGVDb250ZXh0JztcbmltcG9ydCB7IEVsZW1lbnRQcm9wcyB9IGZyb20gJy4uLy4uL2NvcmUvVmlld0NvbXBvbmVudCc7XG5pbXBvcnQgeyBCdXR0b25Db2xvciwgRnVuY1R5cGUgfSBmcm9tICcuLi8uLi9idXR0b24vZW51bSc7XG5pbXBvcnQgeyBCdXR0b25Qcm9wcyB9IGZyb20gJy4uLy4uL2J1dHRvbi9CdXR0b24nO1xuaW1wb3J0IEZvcm0gZnJvbSAnLi4vLi4vZm9ybSc7XG5pbXBvcnQgeyBGb3JtUHJvcHMgfSBmcm9tICcuLi8uLi9mb3JtL0Zvcm0nO1xuaW1wb3J0IHsgJGwgfSBmcm9tICcuLi8uLi9sb2NhbGUtY29udGV4dCc7XG5pbXBvcnQgYXV0b2JpbmQgZnJvbSAnLi4vLi4vX3V0aWwvYXV0b2JpbmQnO1xuaW1wb3J0IFRhYmxlQnV0dG9ucyBmcm9tICcuL1RhYmxlQnV0dG9ucyc7XG5pbXBvcnQgeyBMYWJlbExheW91dCB9IGZyb20gJy4uLy4uL2Zvcm0vZW51bSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgVGFibGVQcm9mZXNzaW9uYWxCYXJQcm9wcyBleHRlbmRzIEVsZW1lbnRQcm9wcyB7XG4gIGRhdGFTZXQ6IERhdGFTZXQ7XG4gIHF1ZXJ5RGF0YVNldD86IERhdGFTZXQ7XG4gIHF1ZXJ5RmllbGRzOiBSZWFjdEVsZW1lbnQ8YW55PltdO1xuICBxdWVyeUZpZWxkc0xpbWl0PzogbnVtYmVyO1xuICBidXR0b25zOiBSZWFjdEVsZW1lbnQ8QnV0dG9uUHJvcHM+W107XG4gIHF1ZXJ5QmFyUHJvcHM/OiBGb3JtUHJvcHM7XG59XG5cbkBvYnNlcnZlclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGFibGVQcm9mZXNzaW9uYWxCYXIgZXh0ZW5kcyBDb21wb25lbnQ8VGFibGVQcm9mZXNzaW9uYWxCYXJQcm9wcz4ge1xuICBzdGF0aWMgY29udGV4dFR5cGUgPSBUYWJsZUNvbnRleHQ7XG5cbiAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICBwcmVmaXhDbHM6IGdldFByb1ByZWZpeENscygndGFibGUnKSxcbiAgICBxdWVyeUZpZWxkc0xpbWl0OiAzLFxuICB9O1xuXG4gIEBvYnNlcnZhYmxlIG1vcmVGaWVsZHM6IEZpZWxkW107XG5cbiAgQGF1dG9iaW5kXG4gIGhhbmRsZUZpZWxkRW50ZXIoKSB7XG4gICAgdGhpcy5oYW5kbGVRdWVyeSgpO1xuICB9XG5cbiAgQGF1dG9iaW5kXG4gIGFzeW5jIGhhbmRsZVF1ZXJ5KCkge1xuICAgIGNvbnN0IHsgZGF0YVNldCwgcXVlcnlEYXRhU2V0IH0gPSB0aGlzLnByb3BzO1xuICAgIGlmIChhd2FpdCBxdWVyeURhdGFTZXQ/LnZhbGlkYXRlKCkpIHtcbiAgICAgIGRhdGFTZXQucXVlcnkoKTtcbiAgICB9XG4gIH1cblxuICBAYWN0aW9uXG4gIG9wZW5Nb3JlID0gKGZpZWxkczogRmllbGRbXSkgPT4ge1xuICAgIGlmICh0aGlzLm1vcmVGaWVsZHMgJiYgdGhpcy5tb3JlRmllbGRzLmxlbmd0aCkge1xuICAgICAgdGhpcy5tb3JlRmllbGRzID0gW107XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubW9yZUZpZWxkcyA9IGZpZWxkcztcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMubW9yZUZpZWxkcztcbiAgfTtcblxuICBnZXRSZXNldEJ1dHRvbigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPEJ1dHRvbiBmdW5jVHlwZT17RnVuY1R5cGUucmFpc2VkfSBvbkNsaWNrPXt0aGlzLmhhbmRsZVF1ZXJ5UmVzZXR9PlxuICAgICAgICB7JGwoJ1RhYmxlJywgJ3Jlc2V0X2J1dHRvbicpfVxuICAgICAgPC9CdXR0b24+XG4gICAgKTtcbiAgfVxuXG4gIGdldE1vcmVGaWVsZHNCdXR0b24oZmllbGRzKSB7XG4gICAgaWYgKGZpZWxkcy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxCdXR0b25cbiAgICAgICAgICBmdW5jVHlwZT17RnVuY1R5cGUucmFpc2VkfVxuICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHRoaXMub3Blbk1vcmUoZmllbGRzKX1cbiAgICAgICAgPlxuICAgICAgICAgIHskbCgnVGFibGUnLCAnbW9yZScpfVxuICAgICAgICAgIHt0aGlzLm1vcmVGaWVsZHMgJiYgdGhpcy5tb3JlRmllbGRzLmxlbmd0aCA/IDxJY29uIHR5cGU9J2V4cGFuZF9sZXNzJyAvPiA6IDxJY29uIHR5cGU9J2V4cGFuZF9tb3JlJyAvPn1cbiAgICAgICAgPC9CdXR0b24+XG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIGdldFF1ZXJ5QmFyKCk6IFJlYWN0Tm9kZSB7XG4gICAgY29uc3QgeyBwcmVmaXhDbHMsIHF1ZXJ5RmllbGRzTGltaXQsIHF1ZXJ5RmllbGRzLCBxdWVyeURhdGFTZXQsIHF1ZXJ5QmFyUHJvcHMgfSA9IHRoaXMucHJvcHM7XG4gICAgaWYgKHF1ZXJ5RGF0YVNldCAmJiBxdWVyeUZpZWxkcy5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IGN1cnJlbnRGaWVsZHMgPSAoXG4gICAgICAgIDxGb3JtXG4gICAgICAgICAgdXNlQ29sb249e2ZhbHNlfVxuICAgICAgICAgIGRhdGFTZXQ9e3F1ZXJ5RGF0YVNldH1cbiAgICAgICAgICBjb2x1bW5zPXtxdWVyeUZpZWxkc0xpbWl0fVxuICAgICAgICAgIGxhYmVsTGF5b3V0PXtMYWJlbExheW91dC5ob3Jpem9udGFsfVxuICAgICAgICAgIHsuLi5xdWVyeUJhclByb3BzfVxuICAgICAgICA+XG4gICAgICAgICAge3F1ZXJ5RmllbGRzLnNsaWNlKDAsIHF1ZXJ5RmllbGRzTGltaXQpfVxuICAgICAgICAgIHt0aGlzLm1vcmVGaWVsZHN9XG4gICAgICAgIDwvRm9ybT5cbiAgICAgICk7XG5cbiAgICAgIGNvbnN0IG1vcmVGaWVsZHMgPSBxdWVyeUZpZWxkcy5zbGljZShxdWVyeUZpZWxkc0xpbWl0KTtcbiAgICAgIGNvbnN0IG1vcmVGaWVsZHNCdXR0b246IFJlYWN0RWxlbWVudCB8IHVuZGVmaW5lZCA9IHRoaXMuZ2V0TW9yZUZpZWxkc0J1dHRvbihtb3JlRmllbGRzKTtcblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGRpdiBrZXk9XCJxdWVyeV9iYXJcIiBjbGFzc05hbWU9e2Ake3ByZWZpeENsc30tcHJvZmVzc2lvbmFsLXF1ZXJ5LWJhcmB9PlxuICAgICAgICAgIHtjdXJyZW50RmllbGRzfVxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT17YCR7cHJlZml4Q2xzfS1wcm9mZXNzaW9uYWwtcXVlcnktYmFyLWJ1dHRvbmB9PlxuICAgICAgICAgICAge21vcmVGaWVsZHNCdXR0b259XG4gICAgICAgICAgICB7dGhpcy5nZXRSZXNldEJ1dHRvbigpfVxuICAgICAgICAgICAgPEJ1dHRvbiBjb2xvcj17QnV0dG9uQ29sb3IucHJpbWFyeX0gb25DbGljaz17dGhpcy5oYW5kbGVRdWVyeX0+XG4gICAgICAgICAgICAgIHskbCgnVGFibGUnLCAncXVlcnlfYnV0dG9uJyl9XG4gICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICA8L3NwYW4+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuXG4gIEBhdXRvYmluZFxuICBoYW5kbGVRdWVyeVJlc2V0KCkge1xuICAgIGNvbnN0IHsgcXVlcnlEYXRhU2V0IH0gPSB0aGlzLnByb3BzO1xuICAgIGlmIChxdWVyeURhdGFTZXQpIHtcbiAgICAgIGNvbnN0IHsgY3VycmVudCB9ID0gcXVlcnlEYXRhU2V0O1xuICAgICAgaWYgKGN1cnJlbnQpIHtcbiAgICAgICAgY3VycmVudC5yZXNldCgpO1xuICAgICAgfVxuICAgICAgdGhpcy5oYW5kbGVRdWVyeSgpO1xuICAgIH1cbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCB7IHByZWZpeENscywgYnV0dG9ucyB9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCBxdWVyeUJhciA9IHRoaXMuZ2V0UXVlcnlCYXIoKTtcbiAgICBjb25zdCB0YWJsZUJ1dHRvbnMgPSBidXR0b25zLmxlbmd0aCA/IChcbiAgICAgIDxkaXYga2V5PVwicHJvZmVzc2lvbmFsX3Rvb2xiYXJcIiBjbGFzc05hbWU9e2Ake3ByZWZpeENsc30tcHJvZmVzc2lvbmFsLXRvb2xiYXJgfT5cbiAgICAgICAgPFRhYmxlQnV0dG9ucyBrZXk9XCJ0b29sYmFyXCIgcHJlZml4Q2xzPXtwcmVmaXhDbHN9IGJ1dHRvbnM9e2J1dHRvbnN9IC8+XG4gICAgICA8L2Rpdj5cbiAgICApIDogbnVsbDtcblxuICAgIHJldHVybiBbcXVlcnlCYXIsIHRhYmxlQnV0dG9uc107XG4gIH1cbn1cbiJdLCJ2ZXJzaW9uIjozfQ==