import { PureComponent } from 'react';
import { findDOMNode } from 'react-dom';
import ResizeObserver from 'resize-observer-polyfill';
class ReactResizeObserver extends PureComponent {
    constructor() {
        super(...arguments);
        this.resizeObserver = null;
        this.width = 0;
        this.height = 0;
        this.onResize = (entries) => {
            const { onResize, resizeProp } = this.props;
            const { target, contentRect: { width, height }, } = entries[0];
            /**
             * getBoundingClientRect return wrong size in transform case.
             */
            // const { width, height } = target.getBoundingClientRect();
            const fixedWidth = Math.floor(width);
            const fixedHeight = Math.floor(height);
            if ((this.width !== fixedWidth && ['width', 'both'].includes(resizeProp)) ||
                (this.height !== fixedHeight && ['height', 'both'].includes(resizeProp))) {
                this.width = fixedWidth;
                this.height = fixedHeight;
                if (onResize) {
                    onResize(fixedWidth, fixedHeight, target);
                }
            }
        };
    }
    componentDidMount() {
        this.onComponentUpdated();
    }
    componentDidUpdate() {
        this.onComponentUpdated();
    }
    componentWillUnmount() {
        this.destroyObserver();
    }
    onComponentUpdated() {
        const { disabled } = this.props;
        const element = findDOMNode(this);
        if (!this.resizeObserver && !disabled && element) {
            // Add resize observer
            this.resizeObserver = new ResizeObserver(this.onResize);
            this.resizeObserver.observe(element);
        }
        else if (disabled) {
            // Remove resize observer
            this.destroyObserver();
        }
    }
    destroyObserver() {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }
    }
    render() {
        const { children = null } = this.props;
        return children;
    }
}
ReactResizeObserver.defaultProps = {
    resizeProp: 'both',
};
export default ReactResizeObserver;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMvX3V0aWwvcmVzaXplT2JzZXJ2ZXIudHN4IiwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxhQUFhLEVBQWEsTUFBTSxPQUFPLENBQUM7QUFDakQsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUN4QyxPQUFPLGNBQWMsTUFBTSwwQkFBMEIsQ0FBQztBQVd0RCxNQUFNLG1CQUFvQixTQUFRLGFBQWtDO0lBQXBFOztRQUtFLG1CQUFjLEdBQTBCLElBQUksQ0FBQztRQUU3QyxVQUFLLEdBQVcsQ0FBQyxDQUFDO1FBRWxCLFdBQU0sR0FBVyxDQUFDLENBQUM7UUEyQm5CLGFBQVEsR0FBMkIsQ0FBQyxPQUE4QixFQUFFLEVBQUU7WUFDcEUsTUFBTSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBRTVDLE1BQU0sRUFDSixNQUFNLEVBQ04sV0FBVyxFQUFFLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxHQUMvQixHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVmOztlQUVHO1lBQ0gsNERBQTREO1lBRTVELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDckMsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUV2QyxJQUNFLENBQUMsSUFBSSxDQUFDLEtBQUssS0FBSyxVQUFVLElBQUksQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUMsUUFBUSxDQUFDLFVBQVcsQ0FBQyxDQUFDO2dCQUN0RSxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssV0FBVyxJQUFJLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxVQUFXLENBQUMsQ0FBQyxFQUN6RTtnQkFDQSxJQUFJLENBQUMsS0FBSyxHQUFHLFVBQVUsQ0FBQztnQkFDeEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxXQUFXLENBQUM7Z0JBRTFCLElBQUksUUFBUSxFQUFFO29CQUNaLFFBQVEsQ0FBQyxVQUFVLEVBQUUsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFDO2lCQUMzQzthQUNGO1FBQ0gsQ0FBQyxDQUFDO0lBYUosQ0FBQztJQWpFQyxpQkFBaUI7UUFDZixJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztJQUM1QixDQUFDO0lBRUQsa0JBQWtCO1FBQ2hCLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0lBQzVCLENBQUM7SUFFRCxvQkFBb0I7UUFDbEIsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO0lBQ3pCLENBQUM7SUFFRCxrQkFBa0I7UUFDaEIsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDaEMsTUFBTSxPQUFPLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBZSxDQUFDO1FBQ2hELElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxJQUFJLENBQUMsUUFBUSxJQUFJLE9BQU8sRUFBRTtZQUNoRCxzQkFBc0I7WUFDdEIsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLGNBQWMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDeEQsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDdEM7YUFBTSxJQUFJLFFBQVEsRUFBRTtZQUNuQix5QkFBeUI7WUFDekIsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1NBQ3hCO0lBQ0gsQ0FBQztJQStCRCxlQUFlO1FBQ2IsSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFO1lBQ3ZCLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDakMsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7U0FDNUI7SUFDSCxDQUFDO0lBRUQsTUFBTTtRQUNKLE1BQU0sRUFBRSxRQUFRLEdBQUcsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN2QyxPQUFPLFFBQVEsQ0FBQztJQUNsQixDQUFDOztBQTFFTSxnQ0FBWSxHQUFHO0lBQ3BCLFVBQVUsRUFBRSxNQUFNO0NBQ25CLENBQUM7QUEyRUosZUFBZSxtQkFBbUIsQ0FBQyIsIm5hbWVzIjpbXSwic291cmNlcyI6WyIvVXNlcnMvaHVpaHVhd2svRG9jdW1lbnRzL29wdC9jaG9lcm9kb24tdWkvY29tcG9uZW50cy9fdXRpbC9yZXNpemVPYnNlcnZlci50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUHVyZUNvbXBvbmVudCwgUmVhY3ROb2RlIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgZmluZERPTU5vZGUgfSBmcm9tICdyZWFjdC1kb20nO1xuaW1wb3J0IFJlc2l6ZU9ic2VydmVyIGZyb20gJ3Jlc2l6ZS1vYnNlcnZlci1wb2x5ZmlsbCc7XG5cbnR5cGUgRG9tRWxlbWVudCA9IEVsZW1lbnQgfCBudWxsO1xuXG5pbnRlcmZhY2UgUmVzaXplT2JzZXJ2ZXJQcm9wcyB7XG4gIGNoaWxkcmVuPzogUmVhY3ROb2RlO1xuICBkaXNhYmxlZD86IGJvb2xlYW47XG4gIG9uUmVzaXplPzogKHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCB0YXJnZXQ6IERvbUVsZW1lbnQpID0+IHZvaWQ7XG4gIHJlc2l6ZVByb3A/OiAnd2lkdGgnIHwgJ2hlaWdodCcgfCAnYm90aCc7XG59XG5cbmNsYXNzIFJlYWN0UmVzaXplT2JzZXJ2ZXIgZXh0ZW5kcyBQdXJlQ29tcG9uZW50PFJlc2l6ZU9ic2VydmVyUHJvcHM+IHtcbiAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICByZXNpemVQcm9wOiAnYm90aCcsXG4gIH07XG5cbiAgcmVzaXplT2JzZXJ2ZXI6IFJlc2l6ZU9ic2VydmVyIHwgbnVsbCA9IG51bGw7XG5cbiAgd2lkdGg6IG51bWJlciA9IDA7XG5cbiAgaGVpZ2h0OiBudW1iZXIgPSAwO1xuXG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIHRoaXMub25Db21wb25lbnRVcGRhdGVkKCk7XG4gIH1cblxuICBjb21wb25lbnREaWRVcGRhdGUoKSB7XG4gICAgdGhpcy5vbkNvbXBvbmVudFVwZGF0ZWQoKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgIHRoaXMuZGVzdHJveU9ic2VydmVyKCk7XG4gIH1cblxuICBvbkNvbXBvbmVudFVwZGF0ZWQoKSB7XG4gICAgY29uc3QgeyBkaXNhYmxlZCB9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCBlbGVtZW50ID0gZmluZERPTU5vZGUodGhpcykgYXMgRG9tRWxlbWVudDtcbiAgICBpZiAoIXRoaXMucmVzaXplT2JzZXJ2ZXIgJiYgIWRpc2FibGVkICYmIGVsZW1lbnQpIHtcbiAgICAgIC8vIEFkZCByZXNpemUgb2JzZXJ2ZXJcbiAgICAgIHRoaXMucmVzaXplT2JzZXJ2ZXIgPSBuZXcgUmVzaXplT2JzZXJ2ZXIodGhpcy5vblJlc2l6ZSk7XG4gICAgICB0aGlzLnJlc2l6ZU9ic2VydmVyLm9ic2VydmUoZWxlbWVudCk7XG4gICAgfSBlbHNlIGlmIChkaXNhYmxlZCkge1xuICAgICAgLy8gUmVtb3ZlIHJlc2l6ZSBvYnNlcnZlclxuICAgICAgdGhpcy5kZXN0cm95T2JzZXJ2ZXIoKTtcbiAgICB9XG4gIH1cblxuICBvblJlc2l6ZTogUmVzaXplT2JzZXJ2ZXJDYWxsYmFjayA9IChlbnRyaWVzOiBSZXNpemVPYnNlcnZlckVudHJ5W10pID0+IHtcbiAgICBjb25zdCB7IG9uUmVzaXplLCByZXNpemVQcm9wIH0gPSB0aGlzLnByb3BzO1xuXG4gICAgY29uc3Qge1xuICAgICAgdGFyZ2V0LFxuICAgICAgY29udGVudFJlY3Q6IHsgd2lkdGgsIGhlaWdodCB9LFxuICAgIH0gPSBlbnRyaWVzWzBdO1xuXG4gICAgLyoqXG4gICAgICogZ2V0Qm91bmRpbmdDbGllbnRSZWN0IHJldHVybiB3cm9uZyBzaXplIGluIHRyYW5zZm9ybSBjYXNlLlxuICAgICAqL1xuICAgIC8vIGNvbnN0IHsgd2lkdGgsIGhlaWdodCB9ID0gdGFyZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgY29uc3QgZml4ZWRXaWR0aCA9IE1hdGguZmxvb3Iod2lkdGgpO1xuICAgIGNvbnN0IGZpeGVkSGVpZ2h0ID0gTWF0aC5mbG9vcihoZWlnaHQpO1xuXG4gICAgaWYgKFxuICAgICAgKHRoaXMud2lkdGggIT09IGZpeGVkV2lkdGggJiYgWyd3aWR0aCcsICdib3RoJ10uaW5jbHVkZXMocmVzaXplUHJvcCEpKSB8fFxuICAgICAgKHRoaXMuaGVpZ2h0ICE9PSBmaXhlZEhlaWdodCAmJiBbJ2hlaWdodCcsICdib3RoJ10uaW5jbHVkZXMocmVzaXplUHJvcCEpKVxuICAgICkge1xuICAgICAgdGhpcy53aWR0aCA9IGZpeGVkV2lkdGg7XG4gICAgICB0aGlzLmhlaWdodCA9IGZpeGVkSGVpZ2h0O1xuXG4gICAgICBpZiAob25SZXNpemUpIHtcbiAgICAgICAgb25SZXNpemUoZml4ZWRXaWR0aCwgZml4ZWRIZWlnaHQsIHRhcmdldCk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIGRlc3Ryb3lPYnNlcnZlcigpIHtcbiAgICBpZiAodGhpcy5yZXNpemVPYnNlcnZlcikge1xuICAgICAgdGhpcy5yZXNpemVPYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgICB0aGlzLnJlc2l6ZU9ic2VydmVyID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgeyBjaGlsZHJlbiA9IG51bGwgfSA9IHRoaXMucHJvcHM7XG4gICAgcmV0dXJuIGNoaWxkcmVuO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFJlYWN0UmVzaXplT2JzZXJ2ZXI7XG4iXSwidmVyc2lvbiI6M30=