export function getPlacementStyle(placement, defaultTop, defaultBottom) {
    const top = defaultTop ? `${defaultTop}px` : 0;
    const bottom = defaultBottom ? `${defaultBottom}px` : 0;
    const target = {
        left: '24px',
        right: '24px',
        top,
        bottom,
    };
    let style = {};
    switch (placement) {
        case 'top':
            style = {
                bottom: 'auto',
            };
            break;
        case 'right':
            style = {
                left: 'auto',
                top: '50%',
                bottom: 'auto',
            };
            break;
        case 'bottom':
            style = {
                top: 'auto',
            };
            break;
        case 'left':
            style = {
                right: 'auto',
                top: '50%',
                bottom: 'auto',
            };
            break;
        case 'topLeft':
        case 'leftTop':
            style = {
                right: 'auto',
                bottom: 'auto',
            };
            break;
        case 'topRight':
        case 'rightTop':
            style = {
                left: 'auto',
                bottom: 'auto',
            };
            break;
        case 'bottomLeft':
        case 'leftBottom':
            style = {
                right: 'auto',
                top: 'auto',
            };
            break;
        case 'bottomRight':
        case 'rightBottom':
            style = {
                left: 'auto',
                top: 'auto',
            };
            break;
        default:
            break;
    }
    Object.assign(target, style);
    return target;
}
export function getPlacementTransitionName(placement, defaultTransitionName) {
    let transitionName = defaultTransitionName;
    switch (placement) {
        case 'top':
        case 'topLeft':
        case 'topRight':
            transitionName = 'move-up';
            break;
        case 'left':
        case 'leftTop':
        case 'leftBottom':
            transitionName = 'move-left';
            break;
        case 'bottom':
        case 'bottomLeft':
        case 'bottomRight':
            transitionName = 'move-down';
            break;
        case 'right':
        case 'rightTop':
        case 'rightBottom':
            transitionName = 'move-right';
            break;
        default:
            break;
    }
    return transitionName;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMvbWVzc2FnZS91dGlsLnRzeCIsIm1hcHBpbmdzIjoiQUFBQSxNQUFNLFVBQVUsaUJBQWlCLENBQUMsU0FBaUIsRUFBRSxVQUFrQixFQUFFLGFBQXFCO0lBQzVGLE1BQU0sR0FBRyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsR0FBRyxVQUFVLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQy9DLE1BQU0sTUFBTSxHQUFHLGFBQWEsQ0FBQyxDQUFDLENBQUMsR0FBRyxhQUFhLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3hELE1BQU0sTUFBTSxHQUFHO1FBQ2IsSUFBSSxFQUFFLE1BQU07UUFDWixLQUFLLEVBQUUsTUFBTTtRQUNiLEdBQUc7UUFDSCxNQUFNO0tBQ1AsQ0FBQztJQUNGLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQztJQUNmLFFBQVEsU0FBUyxFQUFFO1FBQ2pCLEtBQUssS0FBSztZQUNSLEtBQUssR0FBRztnQkFDTixNQUFNLEVBQUUsTUFBTTthQUNmLENBQUM7WUFDRixNQUFNO1FBQ1IsS0FBSyxPQUFPO1lBQ1YsS0FBSyxHQUFHO2dCQUNOLElBQUksRUFBRSxNQUFNO2dCQUNaLEdBQUcsRUFBRSxLQUFLO2dCQUNWLE1BQU0sRUFBRSxNQUFNO2FBQ2YsQ0FBQztZQUNGLE1BQU07UUFDUixLQUFLLFFBQVE7WUFDWCxLQUFLLEdBQUc7Z0JBQ04sR0FBRyxFQUFFLE1BQU07YUFDWixDQUFDO1lBQ0YsTUFBTTtRQUNSLEtBQUssTUFBTTtZQUNULEtBQUssR0FBRztnQkFDTixLQUFLLEVBQUUsTUFBTTtnQkFDYixHQUFHLEVBQUUsS0FBSztnQkFDVixNQUFNLEVBQUUsTUFBTTthQUNmLENBQUM7WUFDRixNQUFNO1FBQ1IsS0FBSyxTQUFTLENBQUM7UUFDZixLQUFLLFNBQVM7WUFDWixLQUFLLEdBQUc7Z0JBQ04sS0FBSyxFQUFFLE1BQU07Z0JBQ2IsTUFBTSxFQUFFLE1BQU07YUFDZixDQUFDO1lBQ0YsTUFBTTtRQUNSLEtBQUssVUFBVSxDQUFDO1FBQ2hCLEtBQUssVUFBVTtZQUNiLEtBQUssR0FBRztnQkFDTixJQUFJLEVBQUUsTUFBTTtnQkFDWixNQUFNLEVBQUUsTUFBTTthQUNmLENBQUM7WUFDRixNQUFNO1FBQ1IsS0FBSyxZQUFZLENBQUM7UUFDbEIsS0FBSyxZQUFZO1lBQ2YsS0FBSyxHQUFHO2dCQUNOLEtBQUssRUFBRSxNQUFNO2dCQUNiLEdBQUcsRUFBRSxNQUFNO2FBQ1osQ0FBQztZQUNGLE1BQU07UUFDUixLQUFLLGFBQWEsQ0FBQztRQUNuQixLQUFLLGFBQWE7WUFDaEIsS0FBSyxHQUFHO2dCQUNOLElBQUksRUFBRSxNQUFNO2dCQUNaLEdBQUcsRUFBRSxNQUFNO2FBQ1osQ0FBQztZQUNGLE1BQU07UUFDUjtZQUNFLE1BQU07S0FDVDtJQUNELE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzdCLE9BQU8sTUFBTSxDQUFDO0FBQ2hCLENBQUM7QUFFRCxNQUFNLFVBQVUsMEJBQTBCLENBQUMsU0FBaUIsRUFBRSxxQkFBNkI7SUFDekYsSUFBSSxjQUFjLEdBQUcscUJBQXFCLENBQUM7SUFDM0MsUUFBUSxTQUFTLEVBQUU7UUFDakIsS0FBSyxLQUFLLENBQUM7UUFDWCxLQUFLLFNBQVMsQ0FBQztRQUNmLEtBQUssVUFBVTtZQUNiLGNBQWMsR0FBRyxTQUFTLENBQUM7WUFDM0IsTUFBTTtRQUNSLEtBQUssTUFBTSxDQUFDO1FBQ1osS0FBSyxTQUFTLENBQUM7UUFDZixLQUFLLFlBQVk7WUFDZixjQUFjLEdBQUcsV0FBVyxDQUFDO1lBQzdCLE1BQU07UUFDUixLQUFLLFFBQVEsQ0FBQztRQUNkLEtBQUssWUFBWSxDQUFDO1FBQ2xCLEtBQUssYUFBYTtZQUNoQixjQUFjLEdBQUcsV0FBVyxDQUFDO1lBQzdCLE1BQU07UUFDUixLQUFLLE9BQU8sQ0FBQztRQUNiLEtBQUssVUFBVSxDQUFDO1FBQ2hCLEtBQUssYUFBYTtZQUNoQixjQUFjLEdBQUcsWUFBWSxDQUFDO1lBQzlCLE1BQU07UUFDUjtZQUNFLE1BQU07S0FDVDtJQUNELE9BQU8sY0FBYyxDQUFDO0FBQ3hCLENBQUMiLCJuYW1lcyI6W10sInNvdXJjZXMiOlsiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMvbWVzc2FnZS91dGlsLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZnVuY3Rpb24gZ2V0UGxhY2VtZW50U3R5bGUocGxhY2VtZW50OiBzdHJpbmcsIGRlZmF1bHRUb3A6IG51bWJlciwgZGVmYXVsdEJvdHRvbTogbnVtYmVyKSB7XG4gIGNvbnN0IHRvcCA9IGRlZmF1bHRUb3AgPyBgJHtkZWZhdWx0VG9wfXB4YCA6IDA7XG4gIGNvbnN0IGJvdHRvbSA9IGRlZmF1bHRCb3R0b20gPyBgJHtkZWZhdWx0Qm90dG9tfXB4YCA6IDA7XG4gIGNvbnN0IHRhcmdldCA9IHtcbiAgICBsZWZ0OiAnMjRweCcsXG4gICAgcmlnaHQ6ICcyNHB4JyxcbiAgICB0b3AsXG4gICAgYm90dG9tLFxuICB9O1xuICBsZXQgc3R5bGUgPSB7fTtcbiAgc3dpdGNoIChwbGFjZW1lbnQpIHtcbiAgICBjYXNlICd0b3AnOlxuICAgICAgc3R5bGUgPSB7XG4gICAgICAgIGJvdHRvbTogJ2F1dG8nLFxuICAgICAgfTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3JpZ2h0JzpcbiAgICAgIHN0eWxlID0ge1xuICAgICAgICBsZWZ0OiAnYXV0bycsXG4gICAgICAgIHRvcDogJzUwJScsXG4gICAgICAgIGJvdHRvbTogJ2F1dG8nLFxuICAgICAgfTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2JvdHRvbSc6XG4gICAgICBzdHlsZSA9IHtcbiAgICAgICAgdG9wOiAnYXV0bycsXG4gICAgICB9O1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnbGVmdCc6XG4gICAgICBzdHlsZSA9IHtcbiAgICAgICAgcmlnaHQ6ICdhdXRvJyxcbiAgICAgICAgdG9wOiAnNTAlJyxcbiAgICAgICAgYm90dG9tOiAnYXV0bycsXG4gICAgICB9O1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAndG9wTGVmdCc6XG4gICAgY2FzZSAnbGVmdFRvcCc6XG4gICAgICBzdHlsZSA9IHtcbiAgICAgICAgcmlnaHQ6ICdhdXRvJyxcbiAgICAgICAgYm90dG9tOiAnYXV0bycsXG4gICAgICB9O1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAndG9wUmlnaHQnOlxuICAgIGNhc2UgJ3JpZ2h0VG9wJzpcbiAgICAgIHN0eWxlID0ge1xuICAgICAgICBsZWZ0OiAnYXV0bycsXG4gICAgICAgIGJvdHRvbTogJ2F1dG8nLFxuICAgICAgfTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2JvdHRvbUxlZnQnOlxuICAgIGNhc2UgJ2xlZnRCb3R0b20nOlxuICAgICAgc3R5bGUgPSB7XG4gICAgICAgIHJpZ2h0OiAnYXV0bycsXG4gICAgICAgIHRvcDogJ2F1dG8nLFxuICAgICAgfTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2JvdHRvbVJpZ2h0JzpcbiAgICBjYXNlICdyaWdodEJvdHRvbSc6XG4gICAgICBzdHlsZSA9IHtcbiAgICAgICAgbGVmdDogJ2F1dG8nLFxuICAgICAgICB0b3A6ICdhdXRvJyxcbiAgICAgIH07XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgYnJlYWs7XG4gIH1cbiAgT2JqZWN0LmFzc2lnbih0YXJnZXQsIHN0eWxlKTtcbiAgcmV0dXJuIHRhcmdldDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFBsYWNlbWVudFRyYW5zaXRpb25OYW1lKHBsYWNlbWVudDogc3RyaW5nLCBkZWZhdWx0VHJhbnNpdGlvbk5hbWU6IHN0cmluZykge1xuICBsZXQgdHJhbnNpdGlvbk5hbWUgPSBkZWZhdWx0VHJhbnNpdGlvbk5hbWU7XG4gIHN3aXRjaCAocGxhY2VtZW50KSB7XG4gICAgY2FzZSAndG9wJzpcbiAgICBjYXNlICd0b3BMZWZ0JzpcbiAgICBjYXNlICd0b3BSaWdodCc6XG4gICAgICB0cmFuc2l0aW9uTmFtZSA9ICdtb3ZlLXVwJztcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2xlZnQnOlxuICAgIGNhc2UgJ2xlZnRUb3AnOlxuICAgIGNhc2UgJ2xlZnRCb3R0b20nOlxuICAgICAgdHJhbnNpdGlvbk5hbWUgPSAnbW92ZS1sZWZ0JztcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2JvdHRvbSc6XG4gICAgY2FzZSAnYm90dG9tTGVmdCc6XG4gICAgY2FzZSAnYm90dG9tUmlnaHQnOlxuICAgICAgdHJhbnNpdGlvbk5hbWUgPSAnbW92ZS1kb3duJztcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3JpZ2h0JzpcbiAgICBjYXNlICdyaWdodFRvcCc6XG4gICAgY2FzZSAncmlnaHRCb3R0b20nOlxuICAgICAgdHJhbnNpdGlvbk5hbWUgPSAnbW92ZS1yaWdodCc7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgYnJlYWs7XG4gIH1cbiAgcmV0dXJuIHRyYW5zaXRpb25OYW1lO1xufVxuIl0sInZlcnNpb24iOjN9