/**
 * Returns an object consisting of props beyond the scope of the Component.
 * Useful for getting and spreading unknown props from the user.
 * @param {function} Component A function or ReactClass.
 * @param {object} props A ReactElement props object
 * @returns {{}} A shallow copy of the prop object
 */
const getUnhandledProps = (Component, props) => {
    const { handledProps = [], propTypes = {} } = Component;
    const propTypeKeys = Object.keys(propTypes);
    return Object.keys(props).reduce((acc, prop) => {
        if (prop === 'childKey') {
            return acc;
        }
        if (handledProps.length > 0 && handledProps.indexOf(prop) === -1) {
            acc[prop] = props[prop];
        }
        if (propTypeKeys.length > 0 && propTypeKeys.indexOf(prop) === -1) {
            acc[prop] = props[prop];
        }
        return acc;
    }, {});
};
export default getUnhandledProps;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL3BlcmZvcm1hbmNlLXRhYmxlL3V0aWxzL2dldFVuaGFuZGxlZFByb3BzLnRzIiwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE1BQU0saUJBQWlCLEdBQUcsQ0FBQyxTQUFjLEVBQUUsS0FBVSxFQUFFLEVBQUU7SUFDdkQsTUFBTSxFQUFFLFlBQVksR0FBRyxFQUFFLEVBQUUsU0FBUyxHQUFHLEVBQUUsRUFBRSxHQUFHLFNBQVMsQ0FBQztJQUN4RCxNQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBRTVDLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFRLEVBQUUsSUFBWSxFQUFFLEVBQUU7UUFDMUQsSUFBSSxJQUFJLEtBQUssVUFBVSxFQUFFO1lBQ3ZCLE9BQU8sR0FBRyxDQUFDO1NBQ1o7UUFDRCxJQUFJLFlBQVksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLFlBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7WUFDaEUsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN6QjtRQUNELElBQUksWUFBWSxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksWUFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtZQUNoRSxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3pCO1FBRUQsT0FBTyxHQUFHLENBQUM7SUFDYixDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDVCxDQUFDLENBQUM7QUFFRixlQUFlLGlCQUFpQixDQUFDIiwibmFtZXMiOltdLCJzb3VyY2VzIjpbIi9Vc2Vycy9odWlodWF3ay9Eb2N1bWVudHMvb3B0L2Nob2Vyb2Rvbi11aS9jb21wb25lbnRzLXByby9wZXJmb3JtYW5jZS10YWJsZS91dGlscy9nZXRVbmhhbmRsZWRQcm9wcy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFJldHVybnMgYW4gb2JqZWN0IGNvbnNpc3Rpbmcgb2YgcHJvcHMgYmV5b25kIHRoZSBzY29wZSBvZiB0aGUgQ29tcG9uZW50LlxuICogVXNlZnVsIGZvciBnZXR0aW5nIGFuZCBzcHJlYWRpbmcgdW5rbm93biBwcm9wcyBmcm9tIHRoZSB1c2VyLlxuICogQHBhcmFtIHtmdW5jdGlvbn0gQ29tcG9uZW50IEEgZnVuY3Rpb24gb3IgUmVhY3RDbGFzcy5cbiAqIEBwYXJhbSB7b2JqZWN0fSBwcm9wcyBBIFJlYWN0RWxlbWVudCBwcm9wcyBvYmplY3RcbiAqIEByZXR1cm5zIHt7fX0gQSBzaGFsbG93IGNvcHkgb2YgdGhlIHByb3Agb2JqZWN0XG4gKi9cblxuY29uc3QgZ2V0VW5oYW5kbGVkUHJvcHMgPSAoQ29tcG9uZW50OiBhbnksIHByb3BzOiBhbnkpID0+IHtcbiAgY29uc3QgeyBoYW5kbGVkUHJvcHMgPSBbXSwgcHJvcFR5cGVzID0ge30gfSA9IENvbXBvbmVudDtcbiAgY29uc3QgcHJvcFR5cGVLZXlzID0gT2JqZWN0LmtleXMocHJvcFR5cGVzKTtcblxuICByZXR1cm4gT2JqZWN0LmtleXMocHJvcHMpLnJlZHVjZSgoYWNjOiBhbnksIHByb3A6IHN0cmluZykgPT4ge1xuICAgIGlmIChwcm9wID09PSAnY2hpbGRLZXknKSB7XG4gICAgICByZXR1cm4gYWNjO1xuICAgIH1cbiAgICBpZiAoaGFuZGxlZFByb3BzLmxlbmd0aCA+IDAgJiYgaGFuZGxlZFByb3BzLmluZGV4T2YocHJvcCkgPT09IC0xKSB7XG4gICAgICBhY2NbcHJvcF0gPSBwcm9wc1twcm9wXTtcbiAgICB9XG4gICAgaWYgKHByb3BUeXBlS2V5cy5sZW5ndGggPiAwICYmIHByb3BUeXBlS2V5cy5pbmRleE9mKHByb3ApID09PSAtMSkge1xuICAgICAgYWNjW3Byb3BdID0gcHJvcHNbcHJvcF07XG4gICAgfVxuXG4gICAgcmV0dXJuIGFjYztcbiAgfSwge30pO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgZ2V0VW5oYW5kbGVkUHJvcHM7XG4iXSwidmVyc2lvbiI6M30=