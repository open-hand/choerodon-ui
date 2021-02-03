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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMvaW5wdXQvY2FsY3VsYXRlTm9kZUhlaWdodC50c3giLCJtYXBwaW5ncyI6IkFBQUEsbUVBQW1FO0FBRW5FOztHQUVHO0FBRUgsTUFBTSxxQkFBcUIsR0FBRzs7Ozs7Ozs7OztDQVU3QixDQUFDO0FBRUYsTUFBTSxZQUFZLEdBQUc7SUFDbkIsZ0JBQWdCO0lBQ2hCLGFBQWE7SUFDYixhQUFhO0lBQ2IsZ0JBQWdCO0lBQ2hCLGFBQWE7SUFDYixhQUFhO0lBQ2IsV0FBVztJQUNYLGdCQUFnQjtJQUNoQixnQkFBZ0I7SUFDaEIsT0FBTztJQUNQLGFBQWE7SUFDYixjQUFjO0lBQ2QsZUFBZTtJQUNmLGNBQWM7SUFDZCxZQUFZO0NBQ2IsQ0FBQztBQVNGLE1BQU0sa0JBQWtCLEdBQWdDLEVBQUUsQ0FBQztBQUMzRCxJQUFJLGNBQW1DLENBQUM7QUFFeEMsU0FBUyxvQkFBb0IsQ0FBQyxJQUFpQixFQUFFLFFBQVEsR0FBRyxLQUFLO0lBQy9ELE1BQU0sT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUM7UUFDdEMsSUFBSSxDQUFDLFlBQVksQ0FBQyxjQUFjLENBQUM7UUFDakMsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBVyxDQUFDO0lBRXZDLElBQUksUUFBUSxJQUFJLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQzNDLE9BQU8sa0JBQWtCLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDcEM7SUFFRCxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7SUFFNUMsTUFBTSxTQUFTLEdBQ2IsS0FBSyxDQUFDLGdCQUFnQixDQUFDLFlBQVksQ0FBQztRQUNwQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsaUJBQWlCLENBQUM7UUFDekMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLG9CQUFvQixDQUFDLENBQUM7SUFFL0Ms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U0FBUyxHQUFHLGVBQWUsR0FBRyxPQUFPLENBQUM7WUFDdEMsSUFBSSxTQUFTLEtBQUssWUFBWSxFQUFFO2dCQUM5QixTQUFTLEdBQUcsU0FBUyxHQUFHLFdBQVcsR0FBRyxVQUFVLENBQUM7YUFDbEQ7WUFDRCxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7U0FDdEM7UUFDRCxJQUFJLE9BQU8sS0FBSyxJQUFJLEVBQUU7WUFDcEIsU0FBUyxHQUFHLGVBQWUsR0FBRyxPQUFPLENBQUM7WUFDdEMsSUFBSSxTQUFTLEtBQUssWUFBWSxFQUFFO2dCQUM5QixTQUFTLEdBQUcsU0FBUyxHQUFHLFdBQVcsR0FBRyxVQUFVLENBQUM7YUFDbEQ7WUFDRCxTQUFTLEdBQUcsTUFBTSxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUM7WUFDL0MsTUFBTSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1NBQ3RDO0tBQ0Y7SUFDRCx3REFBd0Q7SUFDeEQsSUFBSSxDQUFDLE9BQU8sRUFBRTtRQUNaLFNBQVMsR0FBRyxRQUFRLENBQUM7S0FDdEI7SUFDRCxPQUFPLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLENBQUM7QUFDckQsQ0FBQyIsIm5hbWVzIjpbXSwic291cmNlcyI6WyIvVXNlcnMvaHVpaHVhd2svRG9jdW1lbnRzL29wdC9jaG9lcm9kb24tdWkvY29tcG9uZW50cy9pbnB1dC9jYWxjdWxhdGVOb2RlSGVpZ2h0LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBUaGFua3MgdG8gaHR0cHM6Ly9naXRodWIuY29tL2FuZHJleXBvcHAvcmVhY3QtdGV4dGFyZWEtYXV0b3NpemUvXG5cbi8qKlxuICogY2FsY3VsYXRlTm9kZUhlaWdodCh1aVRleHROb2RlLCB1c2VDYWNoZSA9IGZhbHNlKVxuICovXG5cbmNvbnN0IEhJRERFTl9URVhUQVJFQV9TVFlMRSA9IGBcbiAgbWluLWhlaWdodDowICFpbXBvcnRhbnQ7XG4gIG1heC1oZWlnaHQ6bm9uZSAhaW1wb3J0YW50O1xuICBoZWlnaHQ6MCAhaW1wb3J0YW50O1xuICB2aXNpYmlsaXR5OmhpZGRlbiAhaW1wb3J0YW50O1xuICBvdmVyZmxvdzpoaWRkZW4gIWltcG9ydGFudDtcbiAgcG9zaXRpb246YWJzb2x1dGUgIWltcG9ydGFudDtcbiAgei1pbmRleDotMTAwMCAhaW1wb3J0YW50O1xuICB0b3A6MCAhaW1wb3J0YW50O1xuICByaWdodDowICFpbXBvcnRhbnRcbmA7XG5cbmNvbnN0IFNJWklOR19TVFlMRSA9IFtcbiAgJ2xldHRlci1zcGFjaW5nJyxcbiAgJ2xpbmUtaGVpZ2h0JyxcbiAgJ3BhZGRpbmctdG9wJyxcbiAgJ3BhZGRpbmctYm90dG9tJyxcbiAgJ2ZvbnQtZmFtaWx5JyxcbiAgJ2ZvbnQtd2VpZ2h0JyxcbiAgJ2ZvbnQtc2l6ZScsXG4gICd0ZXh0LXJlbmRlcmluZycsXG4gICd0ZXh0LXRyYW5zZm9ybScsXG4gICd3aWR0aCcsXG4gICd0ZXh0LWluZGVudCcsXG4gICdwYWRkaW5nLWxlZnQnLFxuICAncGFkZGluZy1yaWdodCcsXG4gICdib3JkZXItd2lkdGgnLFxuICAnYm94LXNpemluZycsXG5dO1xuXG5leHBvcnQgaW50ZXJmYWNlIE5vZGVUeXBlIHtcbiAgc2l6aW5nU3R5bGU6IHN0cmluZztcbiAgcGFkZGluZ1NpemU6IG51bWJlcjtcbiAgYm9yZGVyU2l6ZTogbnVtYmVyO1xuICBib3hTaXppbmc6IHN0cmluZztcbn1cblxuY29uc3QgY29tcHV0ZWRTdHlsZUNhY2hlOiB7IFtrZXk6IHN0cmluZ106IE5vZGVUeXBlIH0gPSB7fTtcbmxldCBoaWRkZW5UZXh0YXJlYTogSFRNTFRleHRBcmVhRWxlbWVudDtcblxuZnVuY3Rpb24gY2FsY3VsYXRlTm9kZVN0eWxpbmcobm9kZTogSFRNTEVsZW1lbnQsIHVzZUNhY2hlID0gZmFsc2UpIHtcbiAgY29uc3Qgbm9kZVJlZiA9IChub2RlLmdldEF0dHJpYnV0ZSgnaWQnKSB8fFxuICAgIG5vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLXJlYWN0aWQnKSB8fFxuICAgIG5vZGUuZ2V0QXR0cmlidXRlKCduYW1lJykpIGFzIHN0cmluZztcblxuICBpZiAodXNlQ2FjaGUgJiYgY29tcHV0ZWRTdHlsZUNhY2hlW25vZGVSZWZdKSB7XG4gICAgcmV0dXJuIGNvbXB1dGVkU3R5bGVDYWNoZVtub2RlUmVmXTtcbiAgfVxuXG4gIGNvbnN0IHN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUobm9kZSk7XG5cbiAgY29uc3QgYm94U2l6aW5nID1cbiAgICBzdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKCdib3gtc2l6aW5nJykgfHxcbiAgICBzdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKCctbW96LWJveC1zaXppbmcnKSB8fFxuICAgIHN0eWxlLmdldFByb3BlcnR5VmFsdWUoJy13ZWJraXQtYm94LXNpemluZycpO1xuXG4gIGNvbnN0IHBhZGRpbmdTaXplID1cbiAgICBwYXJzZUZsb2F0KHN0eWxlLmdldFByb3BlcnR5VmFsdWUoJ3BhZGRpbmctYm90dG9tJykpICtcbiAgICBwYXJzZUZsb2F0KHN0eWxlLmdldFByb3BlcnR5VmFsdWUoJ3BhZGRpbmctdG9wJykpO1xuXG4gIGNvbnN0IGJvcmRlclNpemUgPVxuICAgIHBhcnNlRmxvYXQoc3R5bGUuZ2V0UHJvcGVydHlWYWx1ZSgnYm9yZGVyLWJvdHRvbS13aWR0aCcpKSArXG4gICAgcGFyc2VGbG9hdChzdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKCdib3JkZXItdG9wLXdpZHRoJykpO1xuXG4gIGNvbnN0IHNpemluZ1N0eWxlID0gU0laSU5HX1NUWUxFLm1hcChuYW1lID0+IGAke25hbWV9OiR7c3R5bGUuZ2V0UHJvcGVydHlWYWx1ZShuYW1lKX1gKS5qb2luKCc7Jyk7XG5cbiAgY29uc3Qgbm9kZUluZm86IE5vZGVUeXBlID0ge1xuICAgIHNpemluZ1N0eWxlLFxuICAgIHBhZGRpbmdTaXplLFxuICAgIGJvcmRlclNpemUsXG4gICAgYm94U2l6aW5nLFxuICB9O1xuXG4gIGlmICh1c2VDYWNoZSAmJiBub2RlUmVmKSB7XG4gICAgY29tcHV0ZWRTdHlsZUNhY2hlW25vZGVSZWZdID0gbm9kZUluZm87XG4gIH1cblxuICByZXR1cm4gbm9kZUluZm87XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNhbGN1bGF0ZU5vZGVIZWlnaHQoXG4gIHVpVGV4dE5vZGU6IEhUTUxUZXh0QXJlYUVsZW1lbnQsXG4gIHVzZUNhY2hlID0gZmFsc2UsXG4gIG1pblJvd3M6IG51bWJlciB8IG51bGwgPSBudWxsLFxuICBtYXhSb3dzOiBudW1iZXIgfCBudWxsID0gbnVsbCxcbikge1xuICBpZiAoIWhpZGRlblRleHRhcmVhKSB7XG4gICAgaGlkZGVuVGV4dGFyZWEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZXh0YXJlYScpO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoaGlkZGVuVGV4dGFyZWEpO1xuICB9XG5cbiAgLy8gRml4IHdyYXA9XCJvZmZcIiBpc3N1ZVxuXG4gIGlmICh1aVRleHROb2RlLmdldEF0dHJpYnV0ZSgnd3JhcCcpKSB7XG4gICAgaGlkZGVuVGV4dGFyZWEuc2V0QXR0cmlidXRlKCd3cmFwJywgdWlUZXh0Tm9kZS5nZXRBdHRyaWJ1dGUoJ3dyYXAnKSBhcyBzdHJpbmcpO1xuICB9IGVsc2Uge1xuICAgIGhpZGRlblRleHRhcmVhLnJlbW92ZUF0dHJpYnV0ZSgnd3JhcCcpO1xuICB9XG5cbiAgLy8gQ29weSBhbGwgQ1NTIHByb3BlcnRpZXMgdGhhdCBoYXZlIGFuIGltcGFjdCBvbiB0aGUgaGVpZ2h0IG9mIHRoZSBjb250ZW50IGluXG4gIC8vIHRoZSB0ZXh0Ym94XG4gIGNvbnN0IHsgcGFkZGluZ1NpemUsIGJvcmRlclNpemUsIGJveFNpemluZywgc2l6aW5nU3R5bGUgfSA9IGNhbGN1bGF0ZU5vZGVTdHlsaW5nKFxuICAgIHVpVGV4dE5vZGUsXG4gICAgdXNlQ2FjaGUsXG4gICk7XG5cbiAgLy8gTmVlZCB0byBoYXZlIHRoZSBvdmVyZmxvdyBhdHRyaWJ1dGUgdG8gaGlkZSB0aGUgc2Nyb2xsYmFyIG90aGVyd2lzZVxuICAvLyB0ZXh0LWxpbmVzIHdpbGwgbm90IGNhbGN1bGF0ZWQgcHJvcGVybHkgYXMgdGhlIHNoYWRvdyB3aWxsIHRlY2huaWNhbGx5IGJlXG4gIC8vIG5hcnJvd2VyIGZvciBjb250ZW50XG4gIGhpZGRlblRleHRhcmVhLnNldEF0dHJpYnV0ZSgnc3R5bGUnLCBgJHtzaXppbmdTdHlsZX07JHtISURERU5fVEVYVEFSRUFfU1RZTEV9YCk7XG4gIGhpZGRlblRleHRhcmVhLnZhbHVlID0gdWlUZXh0Tm9kZS52YWx1ZSB8fCB1aVRleHROb2RlLnBsYWNlaG9sZGVyIHx8ICcnO1xuXG4gIGxldCBtaW5IZWlnaHQgPSBOdW1iZXIuTUlOX1NBRkVfSU5URUdFUjtcbiAgbGV0IG1heEhlaWdodCA9IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSO1xuICBsZXQgaGVpZ2h0ID0gaGlkZGVuVGV4dGFyZWEuc2Nyb2xsSGVpZ2h0O1xuICBsZXQgb3ZlcmZsb3dZOiBhbnk7XG5cbiAgaWYgKGJveFNpemluZyA9PT0gJ2JvcmRlci1ib3gnKSB7XG4gICAgLy8gYm9yZGVyLWJveDogYWRkIGJvcmRlciwgc2luY2UgaGVpZ2h0ID0gY29udGVudCArIHBhZGRpbmcgKyBib3JkZXJcbiAgICBoZWlnaHQgKz0gYm9yZGVyU2l6ZTtcbiAgfSBlbHNlIGlmIChib3hTaXppbmcgPT09ICdjb250ZW50LWJveCcpIHtcbiAgICAvLyByZW1vdmUgcGFkZGluZywgc2luY2UgaGVpZ2h0ID0gY29udGVudFxuICAgIGhlaWdodCAtPSBwYWRkaW5nU2l6ZTtcbiAgfVxuXG4gIGlmIChtaW5Sb3dzICE9PSBudWxsIHx8IG1heFJvd3MgIT09IG51bGwpIHtcbiAgICAvLyBtZWFzdXJlIGhlaWdodCBvZiBhIHRleHRhcmVhIHdpdGggYSBzaW5nbGUgcm93XG4gICAgaGlkZGVuVGV4dGFyZWEudmFsdWUgPSAnICc7XG4gICAgY29uc3Qgc2luZ2xlUm93SGVpZ2h0ID0gaGlkZGVuVGV4dGFyZWEuc2Nyb2xsSGVpZ2h0IC0gcGFkZGluZ1NpemU7XG4gICAgaWYgKG1pblJvd3MgIT09IG51bGwpIHtcbiAgICAgIG1pbkhlaWdodCA9IHNpbmdsZVJvd0hlaWdodCAqIG1pblJvd3M7XG4gICAgICBpZiAoYm94U2l6aW5nID09PSAnYm9yZGVyLWJveCcpIHtcbiAgICAgICAgbWluSGVpZ2h0ID0gbWluSGVpZ2h0ICsgcGFkZGluZ1NpemUgKyBib3JkZXJTaXplO1xuICAgICAgfVxuICAgICAgaGVpZ2h0ID0gTWF0aC5tYXgobWluSGVpZ2h0LCBoZWlnaHQpO1xuICAgIH1cbiAgICBpZiAobWF4Um93cyAhPT0gbnVsbCkge1xuICAgICAgbWF4SGVpZ2h0ID0gc2luZ2xlUm93SGVpZ2h0ICogbWF4Um93cztcbiAgICAgIGlmIChib3hTaXppbmcgPT09ICdib3JkZXItYm94Jykge1xuICAgICAgICBtYXhIZWlnaHQgPSBtYXhIZWlnaHQgKyBwYWRkaW5nU2l6ZSArIGJvcmRlclNpemU7XG4gICAgICB9XG4gICAgICBvdmVyZmxvd1kgPSBoZWlnaHQgPiBtYXhIZWlnaHQgPyAnJyA6ICdoaWRkZW4nO1xuICAgICAgaGVpZ2h0ID0gTWF0aC5taW4obWF4SGVpZ2h0LCBoZWlnaHQpO1xuICAgIH1cbiAgfVxuICAvLyBSZW1vdmUgc2Nyb2xsIGJhciBmbGFzaCB3aGVuIGF1dG9zaXplIHdpdGhvdXQgbWF4Um93c1xuICBpZiAoIW1heFJvd3MpIHtcbiAgICBvdmVyZmxvd1kgPSAnaGlkZGVuJztcbiAgfVxuICByZXR1cm4geyBoZWlnaHQsIG1pbkhlaWdodCwgbWF4SGVpZ2h0LCBvdmVyZmxvd1kgfTtcbn1cbiJdLCJ2ZXJzaW9uIjozfQ==