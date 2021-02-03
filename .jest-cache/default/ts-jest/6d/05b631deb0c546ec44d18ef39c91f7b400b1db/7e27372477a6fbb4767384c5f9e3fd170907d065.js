import defaultLocale from '../locale-provider/default';
let runtimeLocale = {
    ...defaultLocale.Modal,
};
export function changeConfirmLocale(newLocale) {
    if (newLocale) {
        runtimeLocale = {
            ...runtimeLocale,
            ...newLocale,
        };
    }
    else {
        runtimeLocale = {
            ...defaultLocale.Modal,
        };
    }
}
export function getConfirmLocale() {
    return runtimeLocale;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMvbW9kYWwvbG9jYWxlLnRzeCIsIm1hcHBpbmdzIjoiQUFBQSxPQUFPLGFBQWEsTUFBTSw0QkFBNEIsQ0FBQztBQVF2RCxJQUFJLGFBQWEsR0FBZ0I7SUFDL0IsR0FBRyxhQUFhLENBQUMsS0FBSztDQUN2QixDQUFDO0FBRUYsTUFBTSxVQUFVLG1CQUFtQixDQUFDLFNBQXVCO0lBQ3pELElBQUksU0FBUyxFQUFFO1FBQ2IsYUFBYSxHQUFHO1lBQ2QsR0FBRyxhQUFhO1lBQ2hCLEdBQUcsU0FBUztTQUNiLENBQUM7S0FDSDtTQUFNO1FBQ0wsYUFBYSxHQUFHO1lBQ2QsR0FBRyxhQUFhLENBQUMsS0FBSztTQUN2QixDQUFDO0tBQ0g7QUFDSCxDQUFDO0FBRUQsTUFBTSxVQUFVLGdCQUFnQjtJQUM5QixPQUFPLGFBQWEsQ0FBQztBQUN2QixDQUFDIiwibmFtZXMiOltdLCJzb3VyY2VzIjpbIi9Vc2Vycy9odWlodWF3ay9Eb2N1bWVudHMvb3B0L2Nob2Vyb2Rvbi11aS9jb21wb25lbnRzL21vZGFsL2xvY2FsZS50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGRlZmF1bHRMb2NhbGUgZnJvbSAnLi4vbG9jYWxlLXByb3ZpZGVyL2RlZmF1bHQnO1xuXG5leHBvcnQgaW50ZXJmYWNlIE1vZGFsTG9jYWxlIHtcbiAgb2tUZXh0OiBzdHJpbmc7XG4gIGNhbmNlbFRleHQ6IHN0cmluZztcbiAganVzdE9rVGV4dDogc3RyaW5nO1xufVxuXG5sZXQgcnVudGltZUxvY2FsZTogTW9kYWxMb2NhbGUgPSB7XG4gIC4uLmRlZmF1bHRMb2NhbGUuTW9kYWwsXG59O1xuXG5leHBvcnQgZnVuY3Rpb24gY2hhbmdlQ29uZmlybUxvY2FsZShuZXdMb2NhbGU/OiBNb2RhbExvY2FsZSkge1xuICBpZiAobmV3TG9jYWxlKSB7XG4gICAgcnVudGltZUxvY2FsZSA9IHtcbiAgICAgIC4uLnJ1bnRpbWVMb2NhbGUsXG4gICAgICAuLi5uZXdMb2NhbGUsXG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICBydW50aW1lTG9jYWxlID0ge1xuICAgICAgLi4uZGVmYXVsdExvY2FsZS5Nb2RhbCxcbiAgICB9O1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRDb25maXJtTG9jYWxlKCkge1xuICByZXR1cm4gcnVudGltZUxvY2FsZTtcbn1cbiJdLCJ2ZXJzaW9uIjozfQ==