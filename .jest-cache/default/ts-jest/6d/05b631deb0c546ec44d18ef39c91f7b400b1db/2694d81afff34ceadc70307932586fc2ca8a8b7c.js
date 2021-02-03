import { __decorate } from "tslib";
import { computed } from 'mobx';
import ColumnGroups from './ColumnGroups';
export default class ColumnGroup {
    constructor(column, parent) {
        this.column = column;
        this.parent = parent;
        const { children } = column;
        if (children && children.length > 0) {
            this.children = new ColumnGroups(children);
        }
    }
    get rowSpan() {
        return this.parent.deep - this.deep + 1;
    }
    get colSpan() {
        return this.children ? this.children.wide : 1;
    }
    get deep() {
        return this.children ? this.children.deep + 1 : this.hidden ? 0 : 1;
    }
    get hidden() {
        return this.children ? this.children.hidden : !!this.column.hidden;
    }
    get lastLeaf() {
        return this.children ? this.children.lastLeaf : this.column;
    }
}
__decorate([
    computed
], ColumnGroup.prototype, "rowSpan", null);
__decorate([
    computed
], ColumnGroup.prototype, "colSpan", null);
__decorate([
    computed
], ColumnGroup.prototype, "deep", null);
__decorate([
    computed
], ColumnGroup.prototype, "hidden", null);
__decorate([
    computed
], ColumnGroup.prototype, "lastLeaf", null);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL3RhYmxlL0NvbHVtbkdyb3VwLnRzeCIsIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUVoQyxPQUFPLFlBQVksTUFBTSxnQkFBZ0IsQ0FBQztBQUUxQyxNQUFNLENBQUMsT0FBTyxPQUFPLFdBQVc7SUFnQzlCLFlBQVksTUFBbUIsRUFBRSxNQUFvQjtRQUNuRCxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQixNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUcsTUFBTSxDQUFDO1FBQzVCLElBQUksUUFBUSxJQUFJLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQ25DLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDNUM7SUFDSCxDQUFDO0lBL0JELElBQUksT0FBTztRQUNULE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUdELElBQUksT0FBTztRQUNULE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBR0QsSUFBSSxJQUFJO1FBQ04sT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3RFLENBQUM7SUFHRCxJQUFJLE1BQU07UUFDUixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFDckUsQ0FBQztJQUdELElBQUksUUFBUTtRQUNWLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDOUQsQ0FBQztDQVVGO0FBaENDO0lBREMsUUFBUTswQ0FHUjtBQUdEO0lBREMsUUFBUTswQ0FHUjtBQUdEO0lBREMsUUFBUTt1Q0FHUjtBQUdEO0lBREMsUUFBUTt5Q0FHUjtBQUdEO0lBREMsUUFBUTsyQ0FHUiIsIm5hbWVzIjpbXSwic291cmNlcyI6WyIvVXNlcnMvaHVpaHVhd2svRG9jdW1lbnRzL29wdC9jaG9lcm9kb24tdWkvY29tcG9uZW50cy1wcm8vdGFibGUvQ29sdW1uR3JvdXAudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNvbXB1dGVkIH0gZnJvbSAnbW9ieCc7XG5pbXBvcnQgeyBDb2x1bW5Qcm9wcyB9IGZyb20gJy4vQ29sdW1uJztcbmltcG9ydCBDb2x1bW5Hcm91cHMgZnJvbSAnLi9Db2x1bW5Hcm91cHMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb2x1bW5Hcm91cCB7XG4gIGNvbHVtbjogQ29sdW1uUHJvcHM7XG5cbiAgY2hpbGRyZW4/OiBDb2x1bW5Hcm91cHM7XG5cbiAgcGFyZW50OiBDb2x1bW5Hcm91cHM7XG5cbiAgQGNvbXB1dGVkXG4gIGdldCByb3dTcGFuKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMucGFyZW50LmRlZXAgLSB0aGlzLmRlZXAgKyAxO1xuICB9XG5cbiAgQGNvbXB1dGVkXG4gIGdldCBjb2xTcGFuKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuY2hpbGRyZW4gPyB0aGlzLmNoaWxkcmVuLndpZGUgOiAxO1xuICB9XG5cbiAgQGNvbXB1dGVkXG4gIGdldCBkZWVwKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuY2hpbGRyZW4gPyB0aGlzLmNoaWxkcmVuLmRlZXAgKyAxIDogdGhpcy5oaWRkZW4gPyAwIDogMTtcbiAgfVxuXG4gIEBjb21wdXRlZFxuICBnZXQgaGlkZGVuKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmNoaWxkcmVuID8gdGhpcy5jaGlsZHJlbi5oaWRkZW4gOiAhIXRoaXMuY29sdW1uLmhpZGRlbjtcbiAgfVxuXG4gIEBjb21wdXRlZFxuICBnZXQgbGFzdExlYWYoKTogQ29sdW1uUHJvcHMge1xuICAgIHJldHVybiB0aGlzLmNoaWxkcmVuID8gdGhpcy5jaGlsZHJlbi5sYXN0TGVhZiA6IHRoaXMuY29sdW1uO1xuICB9XG5cbiAgY29uc3RydWN0b3IoY29sdW1uOiBDb2x1bW5Qcm9wcywgcGFyZW50OiBDb2x1bW5Hcm91cHMpIHtcbiAgICB0aGlzLmNvbHVtbiA9IGNvbHVtbjtcbiAgICB0aGlzLnBhcmVudCA9IHBhcmVudDtcbiAgICBjb25zdCB7IGNoaWxkcmVuIH0gPSBjb2x1bW47XG4gICAgaWYgKGNoaWxkcmVuICYmIGNoaWxkcmVuLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuY2hpbGRyZW4gPSBuZXcgQ29sdW1uR3JvdXBzKGNoaWxkcmVuKTtcbiAgICB9XG4gIH1cbn1cbiJdLCJ2ZXJzaW9uIjozfQ==