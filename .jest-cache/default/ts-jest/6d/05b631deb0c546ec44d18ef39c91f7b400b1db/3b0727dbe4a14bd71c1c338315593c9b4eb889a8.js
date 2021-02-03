// Thanks to https://github.com/andreypopp/react-textarea-autosize/
/**
 * calculateNodeHeight(uiTextNode, useCache = false)
 */
const HIDDEN_TEXTAREA_STYLE = `
  min-height:0 !important;
  max-height:none !important;
  height:0 !important;
  visibility:hidden !important;
  overflow:hidden !important;
  position:absolute !important;
  z-index:-1000 !important;
  top:0 !important;
  right:0 !important
`;
const SIZING_STYLE = [
    'letter-spacing',
    'line-height',
    'padding-top',
    'padding-bottom',
    'font-family',
    'font-weight',
    'font-size',
    'text-rendering',
    'text-transform',
    'width',
    'text-indent',
    'padding-left',
    'padding-right',
    'border-width',
    'box-sizing',
];
const computedStyleCache = {};
let hiddenTextarea;
function calculateNodeStyling(node, useCache = false) {
    const nodeRef = (node.getAttribute('id') ||
        node.getAttribute('data-reactid') ||
        node.getAttribute('name'));
    if (useCache && computedStyleCache[nodeRef]) {
        return computedStyleCache[nodeRef];
    }
    const style = window.getComputedStyle(node);
    const boxSizing = style.getPropertyValue('box-sizing') ||
        style.getPropertyValue('-moz-box-sizing') ||
        style.getPropertyValue('-webkit-box-sizing');
    const paddingSize = parseFloat(style.getPropertyValue('padding-bottom')) +
        parseFloat(style.getPropertyValue('padding-top'));
    const borderSize = parseFloat(style.getPropertyValue('border-bottom-width')) +
        parseFloat(style.getPropertyValue('border-top-width'));
    const sizingStyle = SIZING_STYLE.map(name => `${name}:${style.getPropertyValue(name)}`).join(';');
    const nodeInfo = {
        sizingStyle,
        paddingSize,
        borderSize,
        boxSizing,
    };
    if (useCache && nodeRef) {
        computedStyleCache[nodeRef] = nodeInfo;
    }
    return nodeInfo;
}
export default function calculateNodeHeight(uiTextNode, useCache = false, minRows = null, maxRows = null) {
    if (!hiddenTextarea) {
        hiddenTextarea = document.createElement('textarea');
        document.body.appendChild(hiddenTextarea);
    }
    // Fix wrap="off" issue
    if (uiTextNode.getAttribute('wrap')) {
        hiddenTextarea.setAttribute('wrap', uiTextNode.getAttribute('wrap'));
    }
    else {
        hiddenTextarea.removeAttribute('wrap');
    }
    // Copy all CSS properties that have an impact on the height of the content in
    // the textbox
    const { paddingSize, borderSize, boxSizing, sizingStyle } = calculateNodeStyling(uiTextNode, useCache);
    // Need to have the overflow attribute to hide the scrollbar otherwise
    // text-lines will not calculated properly as the shadow will technically be
    // narrower for content
    hiddenTextarea.setAttribute('style', `${sizingStyle};${HIDDEN_TEXTAREA_STYLE}`);
    hiddenTextarea.value = uiTextNode.value || uiTextNode.placeholder || '';
    let minHeight = Number.MIN_SAFE_INTEGER;
    let maxHeight = Number.MAX_SAFE_INTEGER;
    let height = hiddenTextarea.scrollHeight;
    let overflowY;
    if (boxSizing === 'border-box') {
        // border-box: add border, since height = content + padding + border
        height += borderSize;
    }
    else if (boxSizing === 'content-box') {
        // remove padding, since height = content
        height -= paddingSize;
    }
    if (minRows !== null || maxRows !== null) {
        // measure height of a textarea with a single row
        hiddenTextarea.value = ' ';
        const singleRowHeight = hiddenTextarea.scrollHeight - paddingSize;
        if (minRows !== null) {
            minHeight = singleRowHeight * minRows;
            if (boxSizing === 'border-box') {
                minHeight = minHeight + paddingSize + borderSize;
            }
            height = Math.max(minHeight, height);
        }
        if (maxRows !== null) {
            maxHeight = singleRowHeight * maxRows;
            if (boxSizing === 'border-box') {
                maxHeight = maxHeight + paddingSize + borderSize;
            }
            overflowY = height > maxHeight ? '' : 'hidden';
            height = Math.min(maxHeight, height);
        }
    }
    // Remove scroll bar flash when autosize without maxRows
    if (!maxRows) {
        overflowY = 'hidden';
    }
    return { height, minHeight, maxHeight, overflowY };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL3RleHQtYXJlYS9jYWxjdWxhdGVOb2RlSGVpZ2h0LnRzeCIsIm1hcHBpbmdzIjoiQUFBQSxtRUFBbUU7QUFFbkU7O0dBRUc7QUFFSCxNQUFNLHFCQUFxQixHQUFHOzs7Ozs7Ozs7O0NBVTdCLENBQUM7QUFFRixNQUFNLFlBQVksR0FBRztJQUNuQixnQkFBZ0I7SUFDaEIsYUFBYTtJQUNiLGFBQWE7SUFDYixnQkFBZ0I7SUFDaEIsYUFBYTtJQUNiLGFBQWE7SUFDYixXQUFXO0lBQ1gsZ0JBQWdCO0lBQ2hCLGdCQUFnQjtJQUNoQixPQUFPO0lBQ1AsYUFBYTtJQUNiLGNBQWM7SUFDZCxlQUFlO0lBQ2YsY0FBYztJQUNkLFlBQVk7Q0FDYixDQUFDO0FBU0YsTUFBTSxrQkFBa0IsR0FBZ0MsRUFBRSxDQUFDO0FBQzNELElBQUksY0FBbUMsQ0FBQztBQUV4QyxTQUFTLG9CQUFvQixDQUFDLElBQWlCLEVBQUUsUUFBUSxHQUFHLEtBQUs7SUFDL0QsTUFBTSxPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQztRQUN0QyxJQUFJLENBQUMsWUFBWSxDQUFDLGNBQWMsQ0FBQztRQUNqQyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFXLENBQUM7SUFFdkMsSUFBSSxRQUFRLElBQUksa0JBQWtCLENBQUMsT0FBTyxDQUFDLEVBQUU7UUFDM0MsT0FBTyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUNwQztJQUVELE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUU1QyxNQUFNLFNBQVMsR0FDYixLQUFLLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxDQUFDO1FBQ3BDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxpQkFBaUIsQ0FBQztRQUN6QyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsb0JBQW9CLENBQUMsQ0FB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RTtZQUNwQixTQUFTLEdBQUcsZUFBZSxHQUFHLE9BQU8sQ0FBQztZQUN0QyxJQUFJLFNBQVMsS0FBSyxZQUFZLEVBQUU7Z0JBQzlCLFNBQVMsR0FBRyxTQUFTLEdBQUcsV0FBVyxHQUFHLFVBQVUsQ0FBQzthQUNsRDtZQUNELE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztTQUN0QztRQUNELElBQUksT0FBTyxLQUFLLElBQUksRUFBRTtZQUNwQixTQUFTLEdBQUcsZUFBZSxHQUFHLE9BQU8sQ0FBQztZQUN0QyxJQUFJLFNBQVMsS0FBSyxZQUFZLEVBQUU7Z0JBQzlCLFNBQVMsR0FBRyxTQUFTLEdBQUcsV0FBVyxHQUFHLFVBQVUsQ0FBQzthQUNsRDtZQUNELFNBQVMsR0FBRyxNQUFNLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztZQUMvQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7U0FDdEM7S0FDRjtJQUVELHdEQUF3RDtJQUN4RCxJQUFJLENBQUMsT0FBTyxFQUFFO1FBQ1osU0FBUyxHQUFHLFFBQVEsQ0FBQztLQUN0QjtJQUVELE9BQU8sRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsQ0FBQztBQUNyRCxDQUFDIiwibmFtZXMiOltdLCJzb3VyY2VzIjpbIi9Vc2Vycy9odWlodWF3ay9Eb2N1bWVudHMvb3B0L2Nob2Vyb2Rvbi11aS9jb21wb25lbnRzLXByby90ZXh0LWFyZWEvY2FsY3VsYXRlTm9kZUhlaWdodC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLy8gVGhhbmtzIHRvIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmRyZXlwb3BwL3JlYWN0LXRleHRhcmVhLWF1dG9zaXplL1xuXG4vKipcbiAqIGNhbGN1bGF0ZU5vZGVIZWlnaHQodWlUZXh0Tm9kZSwgdXNlQ2FjaGUgPSBmYWxzZSlcbiAqL1xuXG5jb25zdCBISURERU5fVEVYVEFSRUFfU1RZTEUgPSBgXG4gIG1pbi1oZWlnaHQ6MCAhaW1wb3J0YW50O1xuICBtYXgtaGVpZ2h0Om5vbmUgIWltcG9ydGFudDtcbiAgaGVpZ2h0OjAgIWltcG9ydGFudDtcbiAgdmlzaWJpbGl0eTpoaWRkZW4gIWltcG9ydGFudDtcbiAgb3ZlcmZsb3c6aGlkZGVuICFpbXBvcnRhbnQ7XG4gIHBvc2l0aW9uOmFic29sdXRlICFpbXBvcnRhbnQ7XG4gIHotaW5kZXg6LTEwMDAgIWltcG9ydGFudDtcbiAgdG9wOjAgIWltcG9ydGFudDtcbiAgcmlnaHQ6MCAhaW1wb3J0YW50XG5gO1xuXG5jb25zdCBTSVpJTkdfU1RZTEUgPSBbXG4gICdsZXR0ZXItc3BhY2luZycsXG4gICdsaW5lLWhlaWdodCcsXG4gICdwYWRkaW5nLXRvcCcsXG4gICdwYWRkaW5nLWJvdHRvbScsXG4gICdmb250LWZhbWlseScsXG4gICdmb250LXdlaWdodCcsXG4gICdmb250LXNpemUnLFxuICAndGV4dC1yZW5kZXJpbmcnLFxuICAndGV4dC10cmFuc2Zvcm0nLFxuICAnd2lkdGgnLFxuICAndGV4dC1pbmRlbnQnLFxuICAncGFkZGluZy1sZWZ0JyxcbiAgJ3BhZGRpbmctcmlnaHQnLFxuICAnYm9yZGVyLXdpZHRoJyxcbiAgJ2JveC1zaXppbmcnLFxuXTtcblxuZXhwb3J0IGludGVyZmFjZSBOb2RlVHlwZSB7XG4gIHNpemluZ1N0eWxlOiBzdHJpbmc7XG4gIHBhZGRpbmdTaXplOiBudW1iZXI7XG4gIGJvcmRlclNpemU6IG51bWJlcjtcbiAgYm94U2l6aW5nOiBzdHJpbmc7XG59XG5cbmNvbnN0IGNvbXB1dGVkU3R5bGVDYWNoZTogeyBba2V5OiBzdHJpbmddOiBOb2RlVHlwZSB9ID0ge307XG5sZXQgaGlkZGVuVGV4dGFyZWE6IEhUTUxUZXh0QXJlYUVsZW1lbnQ7XG5cbmZ1bmN0aW9uIGNhbGN1bGF0ZU5vZGVTdHlsaW5nKG5vZGU6IEhUTUxFbGVtZW50LCB1c2VDYWNoZSA9IGZhbHNlKSB7XG4gIGNvbnN0IG5vZGVSZWYgPSAobm9kZS5nZXRBdHRyaWJ1dGUoJ2lkJykgfHxcbiAgICBub2RlLmdldEF0dHJpYnV0ZSgnZGF0YS1yZWFjdGlkJykgfHxcbiAgICBub2RlLmdldEF0dHJpYnV0ZSgnbmFtZScpKSBhcyBzdHJpbmc7XG5cbiAgaWYgKHVzZUNhY2hlICYmIGNvbXB1dGVkU3R5bGVDYWNoZVtub2RlUmVmXSkge1xuICAgIHJldHVybiBjb21wdXRlZFN0eWxlQ2FjaGVbbm9kZVJlZl07XG4gIH1cblxuICBjb25zdCBzdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKG5vZGUpO1xuXG4gIGNvbnN0IGJveFNpemluZyA9XG4gICAgc3R5bGUuZ2V0UHJvcGVydHlWYWx1ZSgnYm94LXNpemluZycpIHx8XG4gICAgc3R5bGUuZ2V0UHJvcGVydHlWYWx1ZSgnLW1vei1ib3gtc2l6aW5nJykgfHxcbiAgICBzdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKCctd2Via2l0LWJveC1zaXppbmcnKTtcblxuICBjb25zdCBwYWRkaW5nU2l6ZSA9XG4gICAgcGFyc2VGbG9hdChzdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKCdwYWRkaW5nLWJvdHRvbScpKSArXG4gICAgcGFyc2VGbG9hdChzdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKCdwYWRkaW5nLXRvcCcpKTtcblxuICBjb25zdCBib3JkZXJTaXplID1cbiAgICBwYXJzZUZsb2F0KHN0eWxlLmdldFByb3BlcnR5VmFsdWUoJ2JvcmRlci1ib3R0b20td2lkdGgnKSkgK1xuICAgIHBhcnNlRmxvYXQoc3R5bGUuZ2V0UHJvcGVydHlWYWx1ZSgnYm9yZGVyLXRvcC13aWR0aCcpKTtcblxuICBjb25zdCBzaXppbmdTdHlsZSA9IFNJWklOR19TVFlMRS5tYXAobmFtZSA9PiBgJHtuYW1lfToke3N0eWxlLmdldFByb3BlcnR5VmFsdWUobmFtZSl9YCkuam9pbignOycpO1xuXG4gIGNvbnN0IG5vZGVJbmZvOiBOb2RlVHlwZSA9IHtcbiAgICBzaXppbmdTdHlsZSxcbiAgICBwYWRkaW5nU2l6ZSxcbiAgICBib3JkZXJTaXplLFxuICAgIGJveFNpemluZyxcbiAgfTtcblxuICBpZiAodXNlQ2FjaGUgJiYgbm9kZVJlZikge1xuICAgIGNvbXB1dGVkU3R5bGVDYWNoZVtub2RlUmVmXSA9IG5vZGVJbmZvO1xuICB9XG5cbiAgcmV0dXJuIG5vZGVJbmZvO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjYWxjdWxhdGVOb2RlSGVpZ2h0KFxuICB1aVRleHROb2RlOiBIVE1MVGV4dEFyZWFFbGVtZW50LFxuICB1c2VDYWNoZSA9IGZhbHNlLFxuICBtaW5Sb3dzOiBudW1iZXIgfCBudWxsID0gbnVsbCxcbiAgbWF4Um93czogbnVtYmVyIHwgbnVsbCA9IG51bGwsXG4pIHtcbiAgaWYgKCFoaWRkZW5UZXh0YXJlYSkge1xuICAgIGhpZGRlblRleHRhcmVhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGV4dGFyZWEnKTtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGhpZGRlblRleHRhcmVhKTtcbiAgfVxuXG4gIC8vIEZpeCB3cmFwPVwib2ZmXCIgaXNzdWVcblxuICBpZiAodWlUZXh0Tm9kZS5nZXRBdHRyaWJ1dGUoJ3dyYXAnKSkge1xuICAgIGhpZGRlblRleHRhcmVhLnNldEF0dHJpYnV0ZSgnd3JhcCcsIHVpVGV4dE5vZGUuZ2V0QXR0cmlidXRlKCd3cmFwJykgYXMgc3RyaW5nKTtcbiAgfSBlbHNlIHtcbiAgICBoaWRkZW5UZXh0YXJlYS5yZW1vdmVBdHRyaWJ1dGUoJ3dyYXAnKTtcbiAgfVxuXG4gIC8vIENvcHkgYWxsIENTUyBwcm9wZXJ0aWVzIHRoYXQgaGF2ZSBhbiBpbXBhY3Qgb24gdGhlIGhlaWdodCBvZiB0aGUgY29udGVudCBpblxuICAvLyB0aGUgdGV4dGJveFxuICBjb25zdCB7IHBhZGRpbmdTaXplLCBib3JkZXJTaXplLCBib3hTaXppbmcsIHNpemluZ1N0eWxlIH0gPSBjYWxjdWxhdGVOb2RlU3R5bGluZyhcbiAgICB1aVRleHROb2RlLFxuICAgIHVzZUNhY2hlLFxuICApO1xuXG4gIC8vIE5lZWQgdG8gaGF2ZSB0aGUgb3ZlcmZsb3cgYXR0cmlidXRlIHRvIGhpZGUgdGhlIHNjcm9sbGJhciBvdGhlcndpc2VcbiAgLy8gdGV4dC1saW5lcyB3aWxsIG5vdCBjYWxjdWxhdGVkIHByb3Blcmx5IGFzIHRoZSBzaGFkb3cgd2lsbCB0ZWNobmljYWxseSBiZVxuICAvLyBuYXJyb3dlciBmb3IgY29udGVudFxuICBoaWRkZW5UZXh0YXJlYS5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgYCR7c2l6aW5nU3R5bGV9OyR7SElEREVOX1RFWFRBUkVBX1NUWUxFfWApO1xuICBoaWRkZW5UZXh0YXJlYS52YWx1ZSA9IHVpVGV4dE5vZGUudmFsdWUgfHwgdWlUZXh0Tm9kZS5wbGFjZWhvbGRlciB8fCAnJztcblxuICBsZXQgbWluSGVpZ2h0ID0gTnVtYmVyLk1JTl9TQUZFX0lOVEVHRVI7XG4gIGxldCBtYXhIZWlnaHQgPSBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUjtcbiAgbGV0IGhlaWdodCA9IGhpZGRlblRleHRhcmVhLnNjcm9sbEhlaWdodDtcbiAgbGV0IG92ZXJmbG93WTogYW55O1xuXG4gIGlmIChib3hTaXppbmcgPT09ICdib3JkZXItYm94Jykge1xuICAgIC8vIGJvcmRlci1ib3g6IGFkZCBib3JkZXIsIHNpbmNlIGhlaWdodCA9IGNvbnRlbnQgKyBwYWRkaW5nICsgYm9yZGVyXG4gICAgaGVpZ2h0ICs9IGJvcmRlclNpemU7XG4gIH0gZWxzZSBpZiAoYm94U2l6aW5nID09PSAnY29udGVudC1ib3gnKSB7XG4gICAgLy8gcmVtb3ZlIHBhZGRpbmcsIHNpbmNlIGhlaWdodCA9IGNvbnRlbnRcbiAgICBoZWlnaHQgLT0gcGFkZGluZ1NpemU7XG4gIH1cblxuICBpZiAobWluUm93cyAhPT0gbnVsbCB8fCBtYXhSb3dzICE9PSBudWxsKSB7XG4gICAgLy8gbWVhc3VyZSBoZWlnaHQgb2YgYSB0ZXh0YXJlYSB3aXRoIGEgc2luZ2xlIHJvd1xuICAgIGhpZGRlblRleHRhcmVhLnZhbHVlID0gJyAnO1xuICAgIGNvbnN0IHNpbmdsZVJvd0hlaWdodCA9IGhpZGRlblRleHRhcmVhLnNjcm9sbEhlaWdodCAtIHBhZGRpbmdTaXplO1xuICAgIGlmIChtaW5Sb3dzICE9PSBudWxsKSB7XG4gICAgICBtaW5IZWlnaHQgPSBzaW5nbGVSb3dIZWlnaHQgKiBtaW5Sb3dzO1xuICAgICAgaWYgKGJveFNpemluZyA9PT0gJ2JvcmRlci1ib3gnKSB7XG4gICAgICAgIG1pbkhlaWdodCA9IG1pbkhlaWdodCArIHBhZGRpbmdTaXplICsgYm9yZGVyU2l6ZTtcbiAgICAgIH1cbiAgICAgIGhlaWdodCA9IE1hdGgubWF4KG1pbkhlaWdodCwgaGVpZ2h0KTtcbiAgICB9XG4gICAgaWYgKG1heFJvd3MgIT09IG51bGwpIHtcbiAgICAgIG1heEhlaWdodCA9IHNpbmdsZVJvd0hlaWdodCAqIG1heFJvd3M7XG4gICAgICBpZiAoYm94U2l6aW5nID09PSAnYm9yZGVyLWJveCcpIHtcbiAgICAgICAgbWF4SGVpZ2h0ID0gbWF4SGVpZ2h0ICsgcGFkZGluZ1NpemUgKyBib3JkZXJTaXplO1xuICAgICAgfVxuICAgICAgb3ZlcmZsb3dZID0gaGVpZ2h0ID4gbWF4SGVpZ2h0ID8gJycgOiAnaGlkZGVuJztcbiAgICAgIGhlaWdodCA9IE1hdGgubWluKG1heEhlaWdodCwgaGVpZ2h0KTtcbiAgICB9XG4gIH1cblxuICAvLyBSZW1vdmUgc2Nyb2xsIGJhciBmbGFzaCB3aGVuIGF1dG9zaXplIHdpdGhvdXQgbWF4Um93c1xuICBpZiAoIW1heFJvd3MpIHtcbiAgICBvdmVyZmxvd1kgPSAnaGlkZGVuJztcbiAgfVxuXG4gIHJldHVybiB7IGhlaWdodCwgbWluSGVpZ2h0LCBtYXhIZWlnaHQsIG92ZXJmbG93WSB9O1xufVxuIl0sInZlcnNpb24iOjN9