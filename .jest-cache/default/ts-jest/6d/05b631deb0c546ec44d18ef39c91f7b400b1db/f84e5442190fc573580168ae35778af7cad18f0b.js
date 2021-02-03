import React from 'react';
import noop from 'lodash/noop';
import { getProPrefixCls } from 'choerodon-ui/lib/configure';
import { getKey, open } from '../modal-container/ModalContainer';
import Icon from '../icon';
import { normalizeProps } from './utils';
export default function confirm(props) {
    const { children, type = 'confirm', onOk = noop, onCancel = noop, onClose = noop, iconType, border = false, okCancel = true, title, ...otherProps } = normalizeProps(props);
    const prefixCls = getProPrefixCls('confirm');
    const titleNode = title && React.createElement("div", { className: `${prefixCls}-title` }, title);
    const contentNode = children && React.createElement("div", { className: `${prefixCls}-content` }, children);
    const iconNode = iconType && (React.createElement("td", { className: `${prefixCls}-icon ${prefixCls}-${type}` },
        React.createElement(Icon, { type: iconType })));
    return new Promise(resolve => {
        open({
            key: getKey(),
            border,
            destroyOnClose: true,
            okCancel,
            closable: false,
            movable: false,
            style: { width: '4.16rem' },
            children: (React.createElement("table", { className: prefixCls },
                React.createElement("tbody", null,
                    React.createElement("tr", null,
                        iconNode,
                        React.createElement("td", null,
                            titleNode,
                            contentNode))))),
            onOk: async () => {
                const result = await onOk();
                if (result !== false) {
                    resolve('ok');
                }
                return result;
            },
            onCancel: async () => {
                const result = await onCancel();
                if (result !== false) {
                    resolve('cancel');
                }
                return result;
            },
            onClose: async () => {
                const result = await onClose();
                if (result !== false) {
                    resolve('cancel');
                }
                return result;
            },
            ...otherProps,
        });
    });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL21vZGFsL2NvbmZpcm0udHN4IiwibWFwcGluZ3MiOiJBQUFBLE9BQU8sS0FBb0IsTUFBTSxPQUFPLENBQUM7QUFDekMsT0FBTyxJQUFJLE1BQU0sYUFBYSxDQUFDO0FBQy9CLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUU3RCxPQUFPLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxNQUFNLG1DQUFtQyxDQUFDO0FBQ2pFLE9BQU8sSUFBSSxNQUFNLFNBQVMsQ0FBQztBQUMzQixPQUFPLEVBQWdCLGNBQWMsRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUV2RCxNQUFNLENBQUMsT0FBTyxVQUFVLE9BQU8sQ0FBQyxLQUE0QztJQUMxRSxNQUFNLEVBQ0osUUFBUSxFQUNSLElBQUksR0FBRyxTQUFTLEVBQ2hCLElBQUksR0FBRyxJQUFJLEVBQ1gsUUFBUSxHQUFHLElBQUksRUFDZixPQUFPLEdBQUcsSUFBSSxFQUNkLFFBQVEsRUFDUixNQUFNLEdBQUcsS0FBSyxFQUNkLFFBQVEsR0FBRyxJQUFJLEVBQ2YsS0FBSyxFQUNMLEdBQUcsVUFBVSxFQUNkLEdBQUcsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzFCLE1BQU0sU0FBUyxHQUFHLGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUM3QyxNQUFNLFNBQVMsR0FBRyxLQUFLLElBQUksNkJBQUssU0FBUyxFQUFFLEdBQUcsU0FBUyxRQUFRLElBQUcsS0FBSyxDQUFPLENBQUM7SUFDL0UsTUFBTSxXQUFXLEdBQUcsUUFBUSxJQUFJLDZCQUFLLFNBQVMsRUFBRSxHQUFHLFNBQVMsVUFBVSxJQUFHLFFBQVEsQ0FBTyxDQUFDO0lBQ3pGLE1BQU0sUUFBUSxHQUFHLFFBQVEsSUFBSSxDQUMzQiw0QkFBSSxTQUFTLEVBQUUsR0FBRyxTQUFTLFNBQVMsU0FBUyxJQUFJLElBQUksRUFBRTtRQUNyRCxvQkFBQyxJQUFJLElBQUMsSUFBSSxFQUFFLFFBQVEsR0FBSSxDQUNyQixDQUNOLENBQUM7SUFDRixPQUFPLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQzNCLElBQUksQ0FBQztZQUNILEdBQUcsRUFBRSxNQUFNLEVBQUU7WUFDYixNQUFNO1lBQ04sY0FBYyxFQUFFLElBQUk7WUFDcEIsUUFBUTtZQUNSLFFBQVEsRUFBRSxLQUFLO1lBQ2YsT0FBTyxFQUFFLEtBQUs7WUFDZCxLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFO1lBQzNCLFFBQVEsRUFBRSxDQUNSLCtCQUFPLFNBQVMsRUFBRSxTQUFTO2dCQUN6QjtvQkFDRTt3QkFDRyxRQUFRO3dCQUNUOzRCQUNHLFNBQVM7NEJBQ1QsV0FBVyxDQUNULENBQ0YsQ0FDQyxDQUNGLENBQ1Q7WUFDRCxJQUFJLEVBQUUsS0FBSyxJQUFJLEVBQUU7Z0JBQ2YsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLEVBQUUsQ0FBQztnQkFDNUIsSUFBSSxNQUFNLEtBQUssS0FBSyxFQUFFO29CQUNwQixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQ2Y7Z0JBQ0QsT0FBTyxNQUFNLENBQUM7WUFDaEIsQ0FBQztZQUNELFFBQVEsRUFBRSxLQUFLLElBQUksRUFBRTtnQkFDbkIsTUFBTSxNQUFNLEdBQUcsTUFBTSxRQUFRLEVBQUUsQ0FBQztnQkFDaEMsSUFBSSxNQUFNLEtBQUssS0FBSyxFQUFFO29CQUNwQixPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7aUJBQ25CO2dCQUNELE9BQU8sTUFBTSxDQUFDO1lBQ2hCLENBQUM7WUFDRCxPQUFPLEVBQUUsS0FBSyxJQUFJLEVBQUU7Z0JBQ2xCLE1BQU0sTUFBTSxHQUFHLE1BQU0sT0FBTyxFQUFFLENBQUM7Z0JBQy9CLElBQUksTUFBTSxLQUFLLEtBQUssRUFBRTtvQkFDcEIsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2lCQUNuQjtnQkFDRCxPQUFPLE1BQU0sQ0FBQztZQUNoQixDQUFDO1lBQ0QsR0FBRyxVQUFVO1NBQ2QsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDIiwibmFtZXMiOltdLCJzb3VyY2VzIjpbIi9Vc2Vycy9odWlodWF3ay9Eb2N1bWVudHMvb3B0L2Nob2Vyb2Rvbi11aS9jb21wb25lbnRzLXByby9tb2RhbC9jb25maXJtLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QsIHsgUmVhY3ROb2RlIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IG5vb3AgZnJvbSAnbG9kYXNoL25vb3AnO1xuaW1wb3J0IHsgZ2V0UHJvUHJlZml4Q2xzIH0gZnJvbSAnY2hvZXJvZG9uLXVpL2xpYi9jb25maWd1cmUnO1xuaW1wb3J0IHsgTW9kYWxQcm9wcyB9IGZyb20gJy4vTW9kYWwnO1xuaW1wb3J0IHsgZ2V0S2V5LCBvcGVuIH0gZnJvbSAnLi4vbW9kYWwtY29udGFpbmVyL01vZGFsQ29udGFpbmVyJztcbmltcG9ydCBJY29uIGZyb20gJy4uL2ljb24nO1xuaW1wb3J0IHsgY29uZmlybVByb3BzLCBub3JtYWxpemVQcm9wcyB9IGZyb20gJy4vdXRpbHMnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjb25maXJtKHByb3BzOiBNb2RhbFByb3BzICYgY29uZmlybVByb3BzIHwgUmVhY3ROb2RlKSB7XG4gIGNvbnN0IHtcbiAgICBjaGlsZHJlbixcbiAgICB0eXBlID0gJ2NvbmZpcm0nLFxuICAgIG9uT2sgPSBub29wLFxuICAgIG9uQ2FuY2VsID0gbm9vcCxcbiAgICBvbkNsb3NlID0gbm9vcCxcbiAgICBpY29uVHlwZSxcbiAgICBib3JkZXIgPSBmYWxzZSxcbiAgICBva0NhbmNlbCA9IHRydWUsXG4gICAgdGl0bGUsXG4gICAgLi4ub3RoZXJQcm9wc1xuICB9ID0gbm9ybWFsaXplUHJvcHMocHJvcHMpO1xuICBjb25zdCBwcmVmaXhDbHMgPSBnZXRQcm9QcmVmaXhDbHMoJ2NvbmZpcm0nKTtcbiAgY29uc3QgdGl0bGVOb2RlID0gdGl0bGUgJiYgPGRpdiBjbGFzc05hbWU9e2Ake3ByZWZpeENsc30tdGl0bGVgfT57dGl0bGV9PC9kaXY+O1xuICBjb25zdCBjb250ZW50Tm9kZSA9IGNoaWxkcmVuICYmIDxkaXYgY2xhc3NOYW1lPXtgJHtwcmVmaXhDbHN9LWNvbnRlbnRgfT57Y2hpbGRyZW59PC9kaXY+O1xuICBjb25zdCBpY29uTm9kZSA9IGljb25UeXBlICYmIChcbiAgICA8dGQgY2xhc3NOYW1lPXtgJHtwcmVmaXhDbHN9LWljb24gJHtwcmVmaXhDbHN9LSR7dHlwZX1gfT5cbiAgICAgIDxJY29uIHR5cGU9e2ljb25UeXBlfSAvPlxuICAgIDwvdGQ+XG4gICk7XG4gIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICBvcGVuKHtcbiAgICAgIGtleTogZ2V0S2V5KCksXG4gICAgICBib3JkZXIsXG4gICAgICBkZXN0cm95T25DbG9zZTogdHJ1ZSxcbiAgICAgIG9rQ2FuY2VsLFxuICAgICAgY2xvc2FibGU6IGZhbHNlLFxuICAgICAgbW92YWJsZTogZmFsc2UsXG4gICAgICBzdHlsZTogeyB3aWR0aDogJzQuMTZyZW0nIH0sXG4gICAgICBjaGlsZHJlbjogKFxuICAgICAgICA8dGFibGUgY2xhc3NOYW1lPXtwcmVmaXhDbHN9PlxuICAgICAgICAgIDx0Ym9keT5cbiAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAge2ljb25Ob2RlfVxuICAgICAgICAgICAgICA8dGQ+XG4gICAgICAgICAgICAgICAge3RpdGxlTm9kZX1cbiAgICAgICAgICAgICAgICB7Y29udGVudE5vZGV9XG4gICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICA8L3RyPlxuICAgICAgICAgIDwvdGJvZHk+XG4gICAgICAgIDwvdGFibGU+XG4gICAgICApLFxuICAgICAgb25PazogYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBvbk9rKCk7XG4gICAgICAgIGlmIChyZXN1bHQgIT09IGZhbHNlKSB7XG4gICAgICAgICAgcmVzb2x2ZSgnb2snKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfSxcbiAgICAgIG9uQ2FuY2VsOiBhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IG9uQ2FuY2VsKCk7XG4gICAgICAgIGlmIChyZXN1bHQgIT09IGZhbHNlKSB7XG4gICAgICAgICAgcmVzb2x2ZSgnY2FuY2VsJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH0sXG4gICAgICBvbkNsb3NlOiBhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IG9uQ2xvc2UoKTtcbiAgICAgICAgaWYgKHJlc3VsdCAhPT0gZmFsc2UpIHtcbiAgICAgICAgICByZXNvbHZlKCdjYW5jZWwnKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfSxcbiAgICAgIC4uLm90aGVyUHJvcHMsXG4gICAgfSk7XG4gIH0pO1xufVxuIl0sInZlcnNpb24iOjN9