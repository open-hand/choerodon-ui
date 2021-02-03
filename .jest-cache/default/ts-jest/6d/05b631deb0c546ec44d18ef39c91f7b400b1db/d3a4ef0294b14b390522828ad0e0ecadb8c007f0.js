import * as React from 'react';
import classNames from 'classnames';
import Title from './Title';
import Paragraph from './Paragraph';
import { getPrefixCls } from '../configure';
import Element from './Element';
function getComponentProps(prop) {
    if (prop && typeof prop === 'object') {
        return prop;
    }
    return {};
}
function getAvatarBasicProps(hasTitle, hasParagraph) {
    if (hasTitle && !hasParagraph) {
        // Square avatar
        return { size: 'large', shape: 'square' };
    }
    return { size: 'large', shape: 'circle' };
}
function getTitleBasicProps(hasAvatar, hasParagraph) {
    if (!hasAvatar && hasParagraph) {
        return { width: '38%' };
    }
    if (hasAvatar && hasParagraph) {
        return { width: '50%' };
    }
    return {};
}
function getParagraphBasicProps(hasAvatar, hasTitle) {
    const basicProps = {};
    // Width
    if (!hasAvatar || !hasTitle) {
        basicProps.width = '61%';
    }
    // Rows
    if (!hasAvatar && hasTitle) {
        basicProps.rows = 3;
    }
    else {
        basicProps.rows = 2;
    }
    return basicProps;
}
class Skeleton extends React.Component {
    constructor() {
        super(...arguments);
        this.renderSkeleton = () => {
            const { prefixCls: customizePrefixCls, loading, className, children, avatar, title, paragraph, active, } = this.props;
            const prefixCls = getPrefixCls('skeleton', customizePrefixCls);
            if (loading || !('loading' in this.props)) {
                const hasAvatar = !!avatar;
                const hasTitle = !!title;
                const hasParagraph = !!paragraph;
                // Avatar
                let avatarNode;
                if (hasAvatar) {
                    const avatarProps = {
                        prefixCls: `${prefixCls}-avatar`,
                        ...getAvatarBasicProps(hasTitle, hasParagraph),
                        ...getComponentProps(avatar),
                    };
                    // We direct use SkeletonElement as avatar in skeleton internal.
                    avatarNode = (React.createElement("div", { className: `${prefixCls}-header` },
                        React.createElement(Element, Object.assign({}, avatarProps))));
                }
                let contentNode;
                if (hasTitle || hasParagraph) {
                    // Title
                    let $title;
                    if (hasTitle) {
                        const titleProps = {
                            prefixCls: `${prefixCls}-title`,
                            ...getTitleBasicProps(hasAvatar, hasParagraph),
                            ...getComponentProps(title),
                        };
                        $title = React.createElement(Title, Object.assign({}, titleProps));
                    }
                    // Paragraph
                    let paragraphNode;
                    if (hasParagraph) {
                        const paragraphProps = {
                            prefixCls: `${prefixCls}-paragraph`,
                            ...getParagraphBasicProps(hasAvatar, hasTitle),
                            ...getComponentProps(paragraph),
                        };
                        paragraphNode = React.createElement(Paragraph, Object.assign({}, paragraphProps));
                    }
                    contentNode = (React.createElement("div", { className: `${prefixCls}-content` },
                        $title,
                        paragraphNode));
                }
                const cls = classNames(prefixCls, className, {
                    [`${prefixCls}-with-avatar`]: hasAvatar,
                    [`${prefixCls}-active`]: active,
                    [`${prefixCls}-rtl`]: false,
                });
                return (React.createElement("div", { className: cls },
                    avatarNode,
                    contentNode));
            }
            return children;
        };
    }
    render() {
        return React.createElement(React.Fragment, null, this.renderSkeleton());
    }
}
Skeleton.defaultProps = {
    avatar: false,
    title: true,
    paragraph: true,
};
export default Skeleton;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMvc2tlbGV0b24vU2tlbGV0b24udHN4IiwibWFwcGluZ3MiOiJBQUFBLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFDO0FBQy9CLE9BQU8sVUFBVSxNQUFNLFlBQVksQ0FBQztBQUNwQyxPQUFPLEtBQTZCLE1BQU0sU0FBUyxDQUFDO0FBQ3BELE9BQU8sU0FBcUMsTUFBTSxhQUFhLENBQUM7QUFDaEUsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUU1QyxPQUFPLE9BQU8sTUFBTSxXQUFXLENBQUM7QUFrQmhDLFNBQVMsaUJBQWlCLENBQUksSUFBNkI7SUFDekQsSUFBSSxJQUFJLElBQUksT0FBTyxJQUFJLEtBQUssUUFBUSxFQUFFO1FBQ3BDLE9BQU8sSUFBSSxDQUFDO0tBQ2I7SUFDRCxPQUFPLEVBQUUsQ0FBQztBQUNaLENBQUM7QUFFRCxTQUFTLG1CQUFtQixDQUFDLFFBQWlCLEVBQUUsWUFBcUI7SUFDbkUsSUFBSSxRQUFRLElBQUksQ0FBQyxZQUFZLEVBQUU7UUFDN0IsZ0JBQWdCO1FBQ2hCLE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsQ0FBQztLQUMzQztJQUVELE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsQ0FBQztBQUM1QyxDQUFDO0FBRUQsU0FBUyxrQkFBa0IsQ0FBQyxTQUFrQixFQUFFLFlBQXFCO0lBQ25FLElBQUksQ0FBQyxTQUFTLElBQUksWUFBWSxFQUFFO1FBQzlCLE9BQU8sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUM7S0FDekI7SUFFRCxJQUFJLFNBQVMsSUFBSSxZQUFZLEVBQUU7UUFDN0IsT0FBTyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsQ0FBQztLQUN6QjtJQUVELE9BQU8sRUFBRSxDQUFDO0FBQ1osQ0FBQztBQUVELFNBQVMsc0JB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LENBQUMsR0FBRyxTQUFTLGNBQWMsQ0FBQyxFQUFFLFNBQVM7b0JBQ3ZDLENBQUMsR0FBRyxTQUFTLFNBQVMsQ0FBQyxFQUFFLE1BQU07b0JBQy9CLENBQUMsR0FBRyxTQUFTLE1BQU0sQ0FBQyxFQUFDLEtBQUs7aUJBQzNCLENBQUMsQ0FBQztnQkFFSCxPQUFPLENBQ0wsNkJBQUssU0FBUyxFQUFFLEdBQUc7b0JBQ2hCLFVBQVU7b0JBQ1YsV0FBVyxDQUNSLENBQ1AsQ0FBQzthQUNIO1lBRUQsT0FBTyxRQUFRLENBQUM7UUFDbEIsQ0FBQyxDQUFDO0lBS0osQ0FBQztJQUhDLE1BQU07UUFDSixPQUFPLDBDQUFHLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBSSxDQUFDO0lBQ3RDLENBQUM7O0FBOUZNLHFCQUFZLEdBQTJCO0lBQzVDLE1BQU0sRUFBRSxLQUFLO0lBQ2IsS0FBSyxFQUFFLElBQUk7SUFDWCxTQUFTLEVBQUUsSUFBSTtDQUNoQixDQUFDO0FBNkZKLGVBQWUsUUFBUSxDQUFDIiwibmFtZXMiOltdLCJzb3VyY2VzIjpbIi9Vc2Vycy9odWlodWF3ay9Eb2N1bWVudHMvb3B0L2Nob2Vyb2Rvbi11aS9jb21wb25lbnRzL3NrZWxldG9uL1NrZWxldG9uLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tICdjbGFzc25hbWVzJztcbmltcG9ydCBUaXRsZSwgeyBTa2VsZXRvblRpdGxlUHJvcHMgfSBmcm9tICcuL1RpdGxlJztcbmltcG9ydCBQYXJhZ3JhcGgsIHsgU2tlbGV0b25QYXJhZ3JhcGhQcm9wcyB9IGZyb20gJy4vUGFyYWdyYXBoJztcbmltcG9ydCB7IGdldFByZWZpeENscyB9IGZyb20gJy4uL2NvbmZpZ3VyZSc7XG5pbXBvcnQgU2tlbGV0b25CdXR0b24gZnJvbSAnLi9CdXR0b24nO1xuaW1wb3J0IEVsZW1lbnQgZnJvbSAnLi9FbGVtZW50JztcbmltcG9ydCBTa2VsZXRvbkF2YXRhciwgeyBBdmF0YXJQcm9wcyB9IGZyb20gJy4vQXZhdGFyJztcbmltcG9ydCBTa2VsZXRvbklucHV0IGZyb20gJy4vSW5wdXQnO1xuXG4vKiBUaGlzIG9ubHkgZm9yIHNrZWxldG9uIGludGVybmFsLiAqL1xuaW50ZXJmYWNlIFNrZWxldG9uQXZhdGFyUHJvcHMgZXh0ZW5kcyBPbWl0PEF2YXRhclByb3BzLCAnYWN0aXZlJz4ge31cblxuZXhwb3J0IGludGVyZmFjZSBTa2VsZXRvblByb3BzIHtcbiAgYWN0aXZlPzogYm9vbGVhbjtcbiAgbG9hZGluZz86IGJvb2xlYW47XG4gIHByZWZpeENscz86IHN0cmluZztcbiAgY2xhc3NOYW1lPzogc3RyaW5nO1xuICBjaGlsZHJlbj86IFJlYWN0LlJlYWN0Tm9kZTtcbiAgYXZhdGFyPzogU2tlbGV0b25BdmF0YXJQcm9wcyB8IGJvb2xlYW47XG4gIHRpdGxlPzogU2tlbGV0b25UaXRsZVByb3BzIHwgYm9vbGVhbjtcbiAgcGFyYWdyYXBoPzogU2tlbGV0b25QYXJhZ3JhcGhQcm9wcyB8IGJvb2xlYW47XG59XG5cbmZ1bmN0aW9uIGdldENvbXBvbmVudFByb3BzPFQ+KHByb3A6IFQgfCBib29sZWFuIHwgdW5kZWZpbmVkKTogVCB8IHt9IHtcbiAgaWYgKHByb3AgJiYgdHlwZW9mIHByb3AgPT09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIHByb3A7XG4gIH1cbiAgcmV0dXJuIHt9O1xufVxuXG5mdW5jdGlvbiBnZXRBdmF0YXJCYXNpY1Byb3BzKGhhc1RpdGxlOiBib29sZWFuLCBoYXNQYXJhZ3JhcGg6IGJvb2xlYW4pOiBTa2VsZXRvbkF2YXRhclByb3BzIHtcbiAgaWYgKGhhc1RpdGxlICYmICFoYXNQYXJhZ3JhcGgpIHtcbiAgICAvLyBTcXVhcmUgYXZhdGFyXG4gICAgcmV0dXJuIHsgc2l6ZTogJ2xhcmdlJywgc2hhcGU6ICdzcXVhcmUnIH07XG4gIH1cblxuICByZXR1cm4geyBzaXplOiAnbGFyZ2UnLCBzaGFwZTogJ2NpcmNsZScgfTtcbn1cblxuZnVuY3Rpb24gZ2V0VGl0bGVCYXNpY1Byb3BzKGhhc0F2YXRhcjogYm9vbGVhbiwgaGFzUGFyYWdyYXBoOiBib29sZWFuKTogU2tlbGV0b25UaXRsZVByb3BzIHtcbiAgaWYgKCFoYXNBdmF0YXIgJiYgaGFzUGFyYWdyYXBoKSB7XG4gICAgcmV0dXJuIHsgd2lkdGg6ICczOCUnIH07XG4gIH1cblxuICBpZiAoaGFzQXZhdGFyICYmIGhhc1BhcmFncmFwaCkge1xuICAgIHJldHVybiB7IHdpZHRoOiAnNTAlJyB9O1xuICB9XG5cbiAgcmV0dXJuIHt9O1xufVxuXG5mdW5jdGlvbiBnZXRQYXJhZ3JhcGhCYXNpY1Byb3BzKGhhc0F2YXRhcjogYm9vbGVhbiwgaGFzVGl0bGU6IGJvb2xlYW4pOiBTa2VsZXRvblBhcmFncmFwaFByb3BzIHtcbiAgY29uc3QgYmFzaWNQcm9wczogU2tlbGV0b25QYXJhZ3JhcGhQcm9wcyA9IHt9O1xuXG4gIC8vIFdpZHRoXG4gIGlmICghaGFzQXZhdGFyIHx8ICFoYXNUaXRsZSkge1xuICAgIGJhc2ljUHJvcHMud2lkdGggPSAnNjElJztcbiAgfVxuXG4gIC8vIFJvd3NcbiAgaWYgKCFoYXNBdmF0YXIgJiYgaGFzVGl0bGUpIHtcbiAgICBiYXNpY1Byb3BzLnJvd3MgPSAzO1xuICB9IGVsc2Uge1xuICAgIGJhc2ljUHJvcHMucm93cyA9IDI7XG4gIH1cblxuICByZXR1cm4gYmFzaWNQcm9wcztcbn1cblxuY2xhc3MgU2tlbGV0b24gZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8U2tlbGV0b25Qcm9wcywgYW55PiB7XG4gIHN0YXRpYyBCdXR0b246IHR5cGVvZiBTa2VsZXRvbkJ1dHRvbjtcblxuICBzdGF0aWMgQXZhdGFyOiB0eXBlb2YgU2tlbGV0b25BdmF0YXI7XG5cbiAgc3RhdGljIElucHV0OiB0eXBlb2YgU2tlbGV0b25JbnB1dDtcblxuICBzdGF0aWMgZGVmYXVsdFByb3BzOiBQYXJ0aWFsPFNrZWxldG9uUHJvcHM+ID0ge1xuICAgIGF2YXRhcjogZmFsc2UsXG4gICAgdGl0bGU6IHRydWUsXG4gICAgcGFyYWdyYXBoOiB0cnVlLFxuICB9O1xuXG4gIHJlbmRlclNrZWxldG9uID0gKCkgPT4ge1xuICAgIGNvbnN0IHtcbiAgICAgIHByZWZpeENsczogY3VzdG9taXplUHJlZml4Q2xzLFxuICAgICAgbG9hZGluZyxcbiAgICAgIGNsYXNzTmFtZSxcbiAgICAgIGNoaWxkcmVuLFxuICAgICAgYXZhdGFyLFxuICAgICAgdGl0bGUsXG4gICAgICBwYXJhZ3JhcGgsXG4gICAgICBhY3RpdmUsXG4gICAgfSA9IHRoaXMucHJvcHM7XG5cbiAgICBjb25zdCBwcmVmaXhDbHMgPSBnZXRQcmVmaXhDbHMoJ3NrZWxldG9uJywgY3VzdG9taXplUHJlZml4Q2xzKTtcblxuICAgIGlmIChsb2FkaW5nIHx8ICEoJ2xvYWRpbmcnIGluIHRoaXMucHJvcHMpKSB7XG4gICAgICBjb25zdCBoYXNBdmF0YXIgPSAhIWF2YXRhcjtcbiAgICAgIGNvbnN0IGhhc1RpdGxlID0gISF0aXRsZTtcbiAgICAgIGNvbnN0IGhhc1BhcmFncmFwaCA9ICEhcGFyYWdyYXBoO1xuXG4gICAgICAvLyBBdmF0YXJcbiAgICAgIGxldCBhdmF0YXJOb2RlO1xuICAgICAgaWYgKGhhc0F2YXRhcikge1xuICAgICAgICBjb25zdCBhdmF0YXJQcm9wczogU2tlbGV0b25BdmF0YXJQcm9wcyA9IHtcbiAgICAgICAgICBwcmVmaXhDbHM6IGAke3ByZWZpeENsc30tYXZhdGFyYCxcbiAgICAgICAgICAuLi5nZXRBdmF0YXJCYXNpY1Byb3BzKGhhc1RpdGxlLCBoYXNQYXJhZ3JhcGgpLFxuICAgICAgICAgIC4uLmdldENvbXBvbmVudFByb3BzKGF2YXRhciksXG4gICAgICAgIH07XG4gICAgICAgIC8vIFdlIGRpcmVjdCB1c2UgU2tlbGV0b25FbGVtZW50IGFzIGF2YXRhciBpbiBza2VsZXRvbiBpbnRlcm5hbC5cbiAgICAgICAgYXZhdGFyTm9kZSA9IChcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YCR7cHJlZml4Q2xzfS1oZWFkZXJgfT5cbiAgICAgICAgICAgIDxFbGVtZW50IHsuLi5hdmF0YXJQcm9wc30gLz5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgbGV0IGNvbnRlbnROb2RlO1xuICAgICAgaWYgKGhhc1RpdGxlIHx8IGhhc1BhcmFncmFwaCkge1xuICAgICAgICAvLyBUaXRsZVxuICAgICAgICBsZXQgJHRpdGxlO1xuICAgICAgICBpZiAoaGFzVGl0bGUpIHtcbiAgICAgICAgICBjb25zdCB0aXRsZVByb3BzOiBTa2VsZXRvblRpdGxlUHJvcHMgPSB7XG4gICAgICAgICAgICBwcmVmaXhDbHM6IGAke3ByZWZpeENsc30tdGl0bGVgLFxuICAgICAgICAgICAgLi4uZ2V0VGl0bGVCYXNpY1Byb3BzKGhhc0F2YXRhciwgaGFzUGFyYWdyYXBoKSxcbiAgICAgICAgICAgIC4uLmdldENvbXBvbmVudFByb3BzKHRpdGxlKSxcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgJHRpdGxlID0gPFRpdGxlIHsuLi50aXRsZVByb3BzfSAvPjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFBhcmFncmFwaFxuICAgICAgICBsZXQgcGFyYWdyYXBoTm9kZTtcbiAgICAgICAgaWYgKGhhc1BhcmFncmFwaCkge1xuICAgICAgICAgIGNvbnN0IHBhcmFncmFwaFByb3BzOiBTa2VsZXRvblBhcmFncmFwaFByb3BzID0ge1xuICAgICAgICAgICAgcHJlZml4Q2xzOiBgJHtwcmVmaXhDbHN9LXBhcmFncmFwaGAsXG4gICAgICAgICAgICAuLi5nZXRQYXJhZ3JhcGhCYXNpY1Byb3BzKGhhc0F2YXRhciwgaGFzVGl0bGUpLFxuICAgICAgICAgICAgLi4uZ2V0Q29tcG9uZW50UHJvcHMocGFyYWdyYXBoKSxcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgcGFyYWdyYXBoTm9kZSA9IDxQYXJhZ3JhcGggey4uLnBhcmFncmFwaFByb3BzfSAvPjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnRlbnROb2RlID0gKFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgJHtwcmVmaXhDbHN9LWNvbnRlbnRgfT5cbiAgICAgICAgICAgIHskdGl0bGV9XG4gICAgICAgICAgICB7cGFyYWdyYXBoTm9kZX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgY2xzID0gY2xhc3NOYW1lcyhwcmVmaXhDbHMsIGNsYXNzTmFtZSwge1xuICAgICAgICBbYCR7cHJlZml4Q2xzfS13aXRoLWF2YXRhcmBdOiBoYXNBdmF0YXIsXG4gICAgICAgIFtgJHtwcmVmaXhDbHN9LWFjdGl2ZWBdOiBhY3RpdmUsXG4gICAgICAgIFtgJHtwcmVmaXhDbHN9LXJ0bGBdOmZhbHNlLFxuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPXtjbHN9PlxuICAgICAgICAgIHthdmF0YXJOb2RlfVxuICAgICAgICAgIHtjb250ZW50Tm9kZX1cbiAgICAgICAgPC9kaXY+XG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiBjaGlsZHJlbjtcbiAgfTtcblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIDw+e3RoaXMucmVuZGVyU2tlbGV0b24oKX08Lz47XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgU2tlbGV0b247XG4iXSwidmVyc2lvbiI6M30=