import React, { Component } from 'react';
import debounce from 'lodash/debounce';
import classNames from 'classnames';
import { getPrefixCls } from '../configure';
import { matchMediaPolifill } from '../_util/mediaQueryListPolyfill';
// matchMedia polyfill for
// https://github.com/WickyNilliams/enquire.js/issues/82
if (typeof window !== 'undefined') {
    // const matchMediaPolyfill = (mediaQuery: string): MediaQueryList => {
    //   return {
    //     media: mediaQuery,
    //     matches: false,
    //     addListener() {
    //     },
    //     removeListener() {
    //     },
    //   };
    // };
    window.matchMedia = window.matchMedia || matchMediaPolifill;
}
// Use require over import (will be lifted up)
// make sure matchMedia polyfill run before require('react-slick')
const SlickCarousel = require('react-slick').default;
export default class Carousel extends Component {
    constructor() {
        super(...arguments);
        this.onWindowResized = debounce(() => {
            const { autoplay } = this.props;
            if (autoplay && this.slick && this.slick.innerSlider && this.slick.innerSlider.autoPlay) {
                this.slick.innerSlider.autoPlay();
            }
        }, 500, {
            leading: false,
        });
        this.saveSlick = (node) => {
            this.slick = node;
        };
    }
    componentDidMount() {
        const { autoplay } = this.props;
        if (autoplay) {
            window.addEventListener('resize', this.onWindowResized);
        }
        this.innerSlider = this.slick && this.slick.innerSlider;
    }
    componentWillUnmount() {
        const { autoplay } = this.props;
        if (autoplay) {
            window.removeEventListener('resize', this.onWindowResized);
            this.onWindowResized.cancel();
        }
    }
    next() {
        this.slick.slickNext();
    }
    prev() {
        this.slick.slickPrev();
    }
    goTo(slide) {
        this.slick.slickGoTo(slide);
    }
    render() {
        const props = {
            ...this.props,
        };
        if (props.effect === 'fade') {
            props.fade = true;
        }
        const prefixCls = getPrefixCls('carousel', props.prefixCls);
        const className = classNames(prefixCls, {
            [`${prefixCls}-vertical`]: props.vertical,
        });
        return (React.createElement("div", { className: className },
            React.createElement(SlickCarousel, Object.assign({ ref: this.saveSlick }, props))));
    }
}
Carousel.displayName = 'Carousel';
Carousel.defaultProps = {
    dots: true,
    arrows: false,
    draggable: false,
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMvY2Fyb3VzZWwvaW5kZXgudHN4IiwibWFwcGluZ3MiOiJBQUFBLE9BQU8sS0FBSyxFQUFFLEVBQUUsU0FBUyxFQUFpQixNQUFNLE9BQU8sQ0FBQztBQUN4RCxPQUFPLFFBQVEsTUFBTSxpQkFBaUIsQ0FBQztBQUN2QyxPQUFPLFVBQVUsTUFBTSxZQUFZLENBQUM7QUFDcEMsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUM1QyxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUVyRSwwQkFBMEI7QUFDMUIsd0RBQXdEO0FBQ3hELElBQUksT0FBTyxNQUFNLEtBQUssV0FBVyxFQUFFO0lBQ2pDLHVFQUF1RTtJQUN2RSxhQUFhO0lBQ2IseUJBQXlCO0lBQ3pCLHNCQUFzQjtJQUN0QixzQkFBc0I7SUFDdEIsU0FBUztJQUNULHlCQUF5QjtJQUN6QixTQUFTO0lBQ1QsT0FBTztJQUNQLEtBQUs7SUFDTCxNQUFNLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQyxVQUFVLElBQUksa0JBQWtCLENBQUM7Q0FDN0Q7QUFDRCw4Q0FBOEM7QUFDOUMsa0VBQWtFO0FBQ2xFLE1BQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQyxPQUFPLENBQUM7QUErQ3JELE1BQU0sQ0FBQyxPQUFPLE9BQU8sUUFBUyxTQUFRLFNBQTRCO0lBQWxFOztRQWFVLG9CQUFlLEdBQUcsUUFBUSxDQUNoQyxHQUFHLEVBQUU7WUFDSCxNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztZQUNoQyxJQUFJLFFBQVEsSUFBSSxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRTtnQkFDdkYsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLENBQUM7YUFDbkM7UUFDSCxDQUFDLEVBQ0QsR0FBRyxFQUNIO1lBQ0UsT0FBTyxFQUFFLEtBQUs7U0FDZixDQUNGLENBQUM7UUFtQkYsY0FBUyxHQUFHLENBQUMsSUFBUyxFQUFFLEVBQUU7WUFDeEIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDcEIsQ0FBQyxDQUFDO0lBbUNKLENBQUM7SUF0REMsaUJBQWlCO1FBQ2YsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDaEMsSUFBSSxRQUFRLEVBQUU7WUFDWixNQUFNLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztTQUN6RDtRQUVELElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQztJQUMxRCxDQUFDO0lBRUQsb0JBQW9CO1FBQ2xCLE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ2hDLElBQUksUUFBUSxFQUFFO1lBQ1osTUFBTSxDQUFDLG1CQUFtQixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDMUQsSUFBSSxDQUFDLGVBQXVCLENBQUMsTUFBTSxFQUFFLENBQUM7U0FDeEM7SUFDSCxDQUFDO0lBTUQsSUFBSTtRQUNGLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDekIsQ0FBQztJQUVELElBQUk7UUFDRixJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQ3pCLENBQUM7SUFFRCxJQUFJLENBQUMsS0FBYTtRQUNoQixJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUM5QixDQUFDO0lBRUQsTUFBTTtRQUNKLE1BQU0sS0FBSyxHQUF1QztZQUNoRCxHQUFHLElBQUksQ0FBQyxLQUFLO1NBQ2QsQ0FBQztRQUVGLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxNQUFNLEVBQUU7WUFDM0IsS0FBSyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7U0FDbkI7UUFFRCxNQUFNLFNBQVMsR0FBRyxZQUFZLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUU1RCxNQUFNLFNBQVMsR0FBRyxVQUFVLENBQUMsU0FBUyxFQUFFO1lBQ3RDLENBQUMsR0FBRyxTQUFTLFdBQVcsQ0FBQyxFQUFFLEtBQUssQ0FBQyxRQUFRO1NBQzFDLENBQUMsQ0FBQztRQUVILE9BQU8sQ0FDTCw2QkFBSyxTQUFTLEVBQUUsU0FBUztZQUN2QixvQkFBQyxhQUFhLGtCQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsU0FBUyxJQUFNLEtBQUssRUFBSSxDQUM3QyxDQUNQLENBQUM7SUFDSixDQUFDOztBQTlFTSxvQkFBVyxHQUFHLFVBQVUsQ0FBQztBQUV6QixxQkFBWSxHQUFHO0lBQ3BCLElBQUksRUFBRSxJQUFJO0lBQ1YsTUFBTSxFQUFFLEtBQUs7SUFDYixTQUFTLEVBQUUsS0FBSztDQUNqQixDQUFDIiwibmFtZXMiOltdLCJzb3VyY2VzIjpbIi9Vc2Vycy9odWlodWF3ay9Eb2N1bWVudHMvb3B0L2Nob2Vyb2Rvbi11aS9jb21wb25lbnRzL2Nhcm91c2VsL2luZGV4LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QsIHsgQ29tcG9uZW50LCBDU1NQcm9wZXJ0aWVzIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IGRlYm91bmNlIGZyb20gJ2xvZGFzaC9kZWJvdW5jZSc7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tICdjbGFzc25hbWVzJztcbmltcG9ydCB7IGdldFByZWZpeENscyB9IGZyb20gJy4uL2NvbmZpZ3VyZSc7XG5pbXBvcnQgeyBtYXRjaE1lZGlhUG9saWZpbGwgfSBmcm9tICcuLi9fdXRpbC9tZWRpYVF1ZXJ5TGlzdFBvbHlmaWxsJztcblxuLy8gbWF0Y2hNZWRpYSBwb2x5ZmlsbCBmb3Jcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWNreU5pbGxpYW1zL2VucXVpcmUuanMvaXNzdWVzLzgyXG5pZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgLy8gY29uc3QgbWF0Y2hNZWRpYVBvbHlmaWxsID0gKG1lZGlhUXVlcnk6IHN0cmluZyk6IE1lZGlhUXVlcnlMaXN0ID0+IHtcbiAgLy8gICByZXR1cm4ge1xuICAvLyAgICAgbWVkaWE6IG1lZGlhUXVlcnksXG4gIC8vICAgICBtYXRjaGVzOiBmYWxzZSxcbiAgLy8gICAgIGFkZExpc3RlbmVyKCkge1xuICAvLyAgICAgfSxcbiAgLy8gICAgIHJlbW92ZUxpc3RlbmVyKCkge1xuICAvLyAgICAgfSxcbiAgLy8gICB9O1xuICAvLyB9O1xuICB3aW5kb3cubWF0Y2hNZWRpYSA9IHdpbmRvdy5tYXRjaE1lZGlhIHx8IG1hdGNoTWVkaWFQb2xpZmlsbDtcbn1cbi8vIFVzZSByZXF1aXJlIG92ZXIgaW1wb3J0ICh3aWxsIGJlIGxpZnRlZCB1cClcbi8vIG1ha2Ugc3VyZSBtYXRjaE1lZGlhIHBvbHlmaWxsIHJ1biBiZWZvcmUgcmVxdWlyZSgncmVhY3Qtc2xpY2snKVxuY29uc3QgU2xpY2tDYXJvdXNlbCA9IHJlcXVpcmUoJ3JlYWN0LXNsaWNrJykuZGVmYXVsdDtcblxuZXhwb3J0IHR5cGUgQ2Fyb3VzZWxFZmZlY3QgPSAnc2Nyb2xseCcgfCAnZmFkZSc7XG5cbi8vIENhcm91c2VsXG5leHBvcnQgaW50ZXJmYWNlIENhcm91c2VsUHJvcHMge1xuICBlZmZlY3Q/OiBDYXJvdXNlbEVmZmVjdDtcbiAgZG90cz86IGJvb2xlYW47XG4gIHZlcnRpY2FsPzogYm9vbGVhbjtcbiAgYXV0b3BsYXk/OiBib29sZWFuO1xuICBlYXNpbmc/OiBzdHJpbmc7XG4gIGJlZm9yZUNoYW5nZT86IChmcm9tOiBudW1iZXIsIHRvOiBudW1iZXIpID0+IHZvaWQ7XG4gIGFmdGVyQ2hhbmdlPzogKGN1cnJlbnQ6IG51bWJlcikgPT4gdm9pZDtcbiAgc3R5bGU/OiBDU1NQcm9wZXJ0aWVzO1xuICBwcmVmaXhDbHM/OiBzdHJpbmc7XG4gIGFjY2Vzc2liaWxpdHk/OiBib29sZWFuO1xuICBuZXh0QXJyb3c/OiBIVE1MRWxlbWVudCB8IGFueTtcbiAgcHJldkFycm93PzogSFRNTEVsZW1lbnQgfCBhbnk7XG4gIHBhdXNlT25Ib3Zlcj86IGJvb2xlYW47XG4gIGNsYXNzTmFtZT86IHN0cmluZztcbiAgYWRhcHRpdmVIZWlnaHQ/OiBib29sZWFuO1xuICBhcnJvd3M/OiBib29sZWFuO1xuICBhdXRvcGxheVNwZWVkPzogbnVtYmVyO1xuICBjZW50ZXJNb2RlPzogYm9vbGVhbjtcbiAgY2VudGVyUGFkZGluZz86IHN0cmluZyB8IGFueTtcbiAgY3NzRWFzZT86IHN0cmluZyB8IGFueTtcbiAgZG90c0NsYXNzPzogc3RyaW5nO1xuICBkcmFnZ2FibGU/OiBib29sZWFuO1xuICBmYWRlPzogYm9vbGVhbjtcbiAgZm9jdXNPblNlbGVjdD86IGJvb2xlYW47XG4gIGluZmluaXRlPzogYm9vbGVhbjtcbiAgaW5pdGlhbFNsaWRlPzogbnVtYmVyO1xuICBsYXp5TG9hZD86IGJvb2xlYW47XG4gIHJ0bD86IGJvb2xlYW47XG4gIHNsaWRlPzogc3RyaW5nO1xuICBzbGlkZXNUb1Nob3c/OiBudW1iZXI7XG4gIHNsaWRlc1RvU2Nyb2xsPzogbnVtYmVyO1xuICBzcGVlZD86IG51bWJlcjtcbiAgc3dpcGU/OiBib29sZWFuO1xuICBzd2lwZVRvU2xpZGU/OiBib29sZWFuO1xuICB0b3VjaE1vdmU/OiBib29sZWFuO1xuICB0b3VjaFRocmVzaG9sZD86IG51bWJlcjtcbiAgdmFyaWFibGVXaWR0aD86IGJvb2xlYW47XG4gIHVzZUNTUz86IGJvb2xlYW47XG4gIHNsaWNrR29Ubz86IG51bWJlcjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2Fyb3VzZWwgZXh0ZW5kcyBDb21wb25lbnQ8Q2Fyb3VzZWxQcm9wcywge30+IHtcbiAgc3RhdGljIGRpc3BsYXlOYW1lID0gJ0Nhcm91c2VsJztcblxuICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgIGRvdHM6IHRydWUsXG4gICAgYXJyb3dzOiBmYWxzZSxcbiAgICBkcmFnZ2FibGU6IGZhbHNlLFxuICB9O1xuXG4gIGlubmVyU2xpZGVyOiBhbnk7XG5cbiAgcHJpdmF0ZSBzbGljazogYW55O1xuXG4gIHByaXZhdGUgb25XaW5kb3dSZXNpemVkID0gZGVib3VuY2UoXG4gICAgKCkgPT4ge1xuICAgICAgY29uc3QgeyBhdXRvcGxheSB9ID0gdGhpcy5wcm9wcztcbiAgICAgIGlmIChhdXRvcGxheSAmJiB0aGlzLnNsaWNrICYmIHRoaXMuc2xpY2suaW5uZXJTbGlkZXIgJiYgdGhpcy5zbGljay5pbm5lclNsaWRlci5hdXRvUGxheSkge1xuICAgICAgICB0aGlzLnNsaWNrLmlubmVyU2xpZGVyLmF1dG9QbGF5KCk7XG4gICAgICB9XG4gICAgfSxcbiAgICA1MDAsXG4gICAge1xuICAgICAgbGVhZGluZzogZmFsc2UsXG4gICAgfSxcbiAgKTtcblxuICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICBjb25zdCB7IGF1dG9wbGF5IH0gPSB0aGlzLnByb3BzO1xuICAgIGlmIChhdXRvcGxheSkge1xuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMub25XaW5kb3dSZXNpemVkKTtcbiAgICB9XG5cbiAgICB0aGlzLmlubmVyU2xpZGVyID0gdGhpcy5zbGljayAmJiB0aGlzLnNsaWNrLmlubmVyU2xpZGVyO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgY29uc3QgeyBhdXRvcGxheSB9ID0gdGhpcy5wcm9wcztcbiAgICBpZiAoYXV0b3BsYXkpIHtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLm9uV2luZG93UmVzaXplZCk7XG4gICAgICAodGhpcy5vbldpbmRvd1Jlc2l6ZWQgYXMgYW55KS5jYW5jZWwoKTtcbiAgICB9XG4gIH1cblxuICBzYXZlU2xpY2sgPSAobm9kZTogYW55KSA9PiB7XG4gICAgdGhpcy5zbGljayA9IG5vZGU7XG4gIH07XG5cbiAgbmV4dCgpIHtcbiAgICB0aGlzLnNsaWNrLnNsaWNrTmV4dCgpO1xuICB9XG5cbiAgcHJldigpIHtcbiAgICB0aGlzLnNsaWNrLnNsaWNrUHJldigpO1xuICB9XG5cbiAgZ29UbyhzbGlkZTogbnVtYmVyKSB7XG4gICAgdGhpcy5zbGljay5zbGlja0dvVG8oc2xpZGUpO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHByb3BzOiBDYXJvdXNlbFByb3BzICYgeyBjaGlsZHJlbj86IGFueSB9ID0ge1xuICAgICAgLi4udGhpcy5wcm9wcyxcbiAgICB9O1xuXG4gICAgaWYgKHByb3BzLmVmZmVjdCA9PT0gJ2ZhZGUnKSB7XG4gICAgICBwcm9wcy5mYWRlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBjb25zdCBwcmVmaXhDbHMgPSBnZXRQcmVmaXhDbHMoJ2Nhcm91c2VsJywgcHJvcHMucHJlZml4Q2xzKTtcblxuICAgIGNvbnN0IGNsYXNzTmFtZSA9IGNsYXNzTmFtZXMocHJlZml4Q2xzLCB7XG4gICAgICBbYCR7cHJlZml4Q2xzfS12ZXJ0aWNhbGBdOiBwcm9wcy52ZXJ0aWNhbCxcbiAgICB9KTtcblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT17Y2xhc3NOYW1lfT5cbiAgICAgICAgPFNsaWNrQ2Fyb3VzZWwgcmVmPXt0aGlzLnNhdmVTbGlja30gey4uLnByb3BzfSAvPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxufVxuIl0sInZlcnNpb24iOjN9