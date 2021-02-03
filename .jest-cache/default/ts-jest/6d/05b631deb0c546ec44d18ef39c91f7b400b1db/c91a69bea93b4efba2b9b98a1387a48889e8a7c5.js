import { __decorate } from "tslib";
import isNil from 'lodash/isNil';
import { action, observable, runInAction } from 'mobx';
import { getConfig } from 'choerodon-ui/lib/configure';
import warning from 'choerodon-ui/lib/_util/warning';
import DataSet from '../data-set/DataSet';
import axios from '../axios';
import { processAxiosConfig } from './utils';
function getFieldType(conditionFieldType) {
    switch (conditionFieldType) {
        case "INT" /* INT */:
            return "number" /* number */;
        case "TEXT" /* TEXT */:
            return "string" /* string */;
        case "DATE" /* DATE */:
            return "date" /* date */;
        case "DATETIME" /* DATETIME */:
            return "dateTime" /* dateTime */;
        case "POPUP" /* POPUP */:
            return "object" /* object */;
        default:
            return conditionFieldType || "string" /* string */;
    }
}
function generateConditionField(fields, { conditionField, conditionFieldType, conditionFieldName, gridFieldName, display, conditionFieldLovCode, conditionFieldSelectCode, conditionFieldSelectUrl, conditionFieldSelectTf, conditionFieldSelectVf, conditionFieldRequired, fieldProps, }) {
    if (conditionField === 'Y') {
        const name = conditionFieldName || gridFieldName;
        const field = {
            name,
            type: getFieldType(conditionFieldType),
            label: display,
            lovCode: conditionFieldLovCode || undefined,
            lookupCode: conditionFieldSelectCode || undefined,
            lookupUrl: conditionFieldSelectUrl || undefined,
            textField: conditionFieldSelectTf || undefined,
            valueField: conditionFieldSelectVf || undefined,
            required: conditionFieldRequired || undefined,
            ...fieldProps,
        };
        fields.push(field);
        if (conditionFieldType === "POPUP" /* POPUP */) {
            const aliasName = `__lov__${name}`;
            field.name = aliasName;
            fields.push({
                name,
                bind: `${aliasName}.${conditionFieldSelectVf}`,
            });
        }
    }
}
function generateGridField(fields, { gridField, gridFieldName, display, fieldProps }, valueField) {
    if (gridField === 'Y') {
        fields.push({
            name: gridFieldName,
            label: display,
            unique: valueField === gridFieldName,
            ...fieldProps,
        });
    }
}
export class LovCodeStore {
    constructor() {
        this.pendings = {};
        this.init();
    }
    get axios() {
        return getConfig('axios') || axios;
    }
    init() {
        this.lovCodes = observable.map();
    }
    getDefineAxiosConfig(code, field) {
        const lovDefineAxiosConfig = (field && field.get('lovDefineAxiosConfig')) || getConfig('lovDefineAxiosConfig');
        const config = processAxiosConfig(lovDefineAxiosConfig, code, field);
        return {
            ...config,
            url: config.url || this.getConfigUrl(code, field),
            method: config.method || 'post',
        };
    }
    getConfig(code) {
        return this.lovCodes.get(code);
    }
    async fetchConfig(code, field) {
        let config = this.getConfig(code);
        // SSR do not fetch the lookup
        if (!config && typeof window !== 'undefined') {
            const axiosConfig = this.getDefineAxiosConfig(code, field);
            if (axiosConfig) {
                try {
                    const pending = this.pendings[code] || this.axios(axiosConfig);
                    this.pendings[code] = pending;
                    config = await pending;
                    runInAction(() => {
                        if (config) {
                            this.lovCodes.set(code, config);
                        }
                    });
                }
                finally {
                    delete this.pendings[code];
                }
            }
        }
        return config;
    }
    // lovCode 作为key 缓存了 ds
    getLovDataSet(code, field) {
        const config = this.getConfig(code);
        if (config) {
            const { lovPageSize, lovItems, parentIdField, idField, valueField, treeFlag } = config;
            const dataSetProps = {
                transport: {
                    read: this.getQueryAxiosConfig(code, field, config),
                },
                primaryKey: valueField,
                cacheSelection: true,
                autoLocateFirst: false,
            };
            if (!isNil(lovPageSize) && !isNaN(Number(lovPageSize))) {
                dataSetProps.pageSize = Number(lovPageSize);
            }
            else {
                dataSetProps.paging = false;
            }
            if (treeFlag === 'Y' && parentIdField && idField) {
                dataSetProps.parentField = parentIdField;
                dataSetProps.idField = idField;
            }
            if (lovItems && lovItems.length) {
                const { querys, fields } = lovItems
                    .sort(({ conditionFieldSequence }, { conditionFieldSequence: conditionFieldSequence2 }) => conditionFieldSequence - conditionFieldSequence2)
                    .reduce((obj, configItem) => {
                    generateConditionField(obj.querys, configItem);
                    generateGridField(obj.fields, configItem, valueField);
                    return obj;
                }, { querys: [], fields: [] });
                if (querys.length) {
                    dataSetProps.queryFields = querys;
                }
                if (fields.length) {
                    dataSetProps.fields = fields;
                }
            }
            return new DataSet(dataSetProps);
        }
        warning(false, `LOV: code<${code}> is not exists`);
        return undefined;
    }
    getConfigUrl(code, field) {
        const lovDefineUrl = (field && field.get('lovDefineUrl')) || getConfig('lovDefineUrl');
        if (typeof lovDefineUrl === 'function') {
            return lovDefineUrl(code);
        }
        return lovDefineUrl;
    }
    getQueryAxiosConfig(code, field, config) {
        return (props) => {
            const lovQueryAxiosConfig = (field && field.get('lovQueryAxiosConfig')) || getConfig('lovQueryAxiosConfig');
            const lovQueryUrl = this.getQueryUrl(code, field, props);
            const axiosConfig = processAxiosConfig(lovQueryAxiosConfig, code, config, props, lovQueryUrl);
            return {
                ...axiosConfig,
                url: axiosConfig.url || lovQueryUrl,
                method: axiosConfig.method || 'post',
            };
        };
    }
    getQueryUrl(code, field, props) {
        const config = this.getConfig(code);
        if (config) {
            const { customUrl } = config;
            if (customUrl) {
                return customUrl;
            }
        }
        const lovQueryUrl = (field && field.get('lovQueryUrl')) || getConfig('lovQueryUrl');
        if (typeof lovQueryUrl === 'function') {
            return lovQueryUrl(code, config, props);
        }
        return lovQueryUrl;
    }
    clearCache(codes) {
        if (codes) {
            codes.forEach(code => {
                this.lovCodes.delete(code);
            });
        }
        else {
            this.lovCodes.clear();
        }
    }
}
__decorate([
    observable
], LovCodeStore.prototype, "lovCodes", void 0);
__decorate([
    action
], LovCodeStore.prototype, "init", null);
__decorate([
    action
], LovCodeStore.prototype, "clearCache", null);
export default new LovCodeStore();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL3N0b3Jlcy9Mb3ZDb2RlU3RvcmUudHN4IiwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEtBQUssTUFBTSxjQUFjLENBQUM7QUFDakMsT0FBTyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQWlCLFdBQVcsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUV0RSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDdkQsT0FBTyxPQUFPLE1BQU0sZ0NBQWdDLENBQUM7QUFDckQsT0FBTyxPQUF5QixNQUFNLHFCQUFxQixDQUFDO0FBQzVELE9BQU8sS0FBSyxNQUFNLFVBQVUsQ0FBQztBQUs3QixPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFHN0MsU0FBUyxZQUFZLENBQUMsa0JBQTZDO0lBQ2pFLFFBQVEsa0JBQWtCLEVBQUU7UUFDMUI7WUFDRSw2QkFBd0I7UUFDMUI7WUFDRSw2QkFBd0I7UUFDMUI7WUFDRSx5QkFBc0I7UUFDeEI7WUFDRSxpQ0FBMEI7UUFDNUI7WUFDRSw2QkFBd0I7UUFDMUI7WUFDRSxPQUFRLGtCQUFnQyx5QkFBb0IsQ0FBQztLQUNoRTtBQUNILENBQUM7QUFFRCxTQUFTLHNCQUFzQixDQUM3QixNQUFvQixFQUNwQixFQUNFLGNBQWMsRUFDZCxrQkFBa0IsRUFDbEIsa0JBQWtCLEVBQ2xCLGFBQWEsRUFDYixPQUFPLEVBQ1AscUJBQXFCLEVBQ3JCLHdCQUF3QixFQUN4Qix1QkFBdUIsRUFDdkIsc0JBQXNCLEVBQ3RCLHNCQUFzQixFQUN0QixzQkFBc0IsRUFDdEIsVUFBVSxHQUNJO0lBRWhCLElBQUksY0FBYyxLQUFLLEdBQUcsRUFBRTtRQUMxQixNQUFNLElBQUksR0FBRyxrQkFBa0IsSUFBSSxhQUFhLENBQUM7UUFDakQsTUFBTSxLQUFLLEdBQUc7WUFDWixJQUFJO1lBQ0osSUFBSSxFQUFFLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQztZQUN0QyxLQUFLLEVBQUUsT0FBTztZQUNkLE9BQU8sRUFBRSxxQkFBcUIsSUFBSSxTQUFTO1lBQzNDLFVBQVUsRUFBRSx3QkFBd0IsSUFBSSxTQUFTO1lBQ2pELFNBQVMsRUFBRSx1QkFBdUIsSUFBSSxTQUFTO1lBQy9DLFNBQVMsRUFBRSxzQkFBc0IsSUFBSSxTQUFTO1lBQzlDLFVBQVUsRUFBRSxzQkFBc0IsSUFBSSxTQUFTO1lBQy9DLFFBQVEsRUFBRSxzQkFBc0IsSUFBSSxTQUFTO1lBQzdDLEdBQUcsVUFBVTtTQUNkLENBQUM7UUFDRixNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ25CLElBQUksa0JBQWtCLHdCQUF1QixFQUFFO1lBQzdDLE1BQU0sU0FBUyxHQUFHLFVBQVUsSUFBSSxFQUFFLENBQUM7WUFDbkMsS0FBSyxDQUFDLElBQUksR0FBRyxTQUFTLENBQUM7WUFDdkIsTUFBTSxDQUFDLElBQUksQ0FBQztnQkFDVixJQUFJO2dCQUNKLElBQUksRUFBRSxHQUFHLFNBQVMsSUFBSSxzQkFBc0IsRUFBRTthQUMvQyxDQUFDLENBQUM7U0FDSjtLQUNGO0FBQ0gsQ0FBQztBQUVELFNBQVMsaUJBQWlCLENBQ3hCLE1BQW9CLEVBQ3BCLEVBQUUsU0FBUyxFQUFFLGFBQWEsRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFpQixFQUNoRSxVQUFtQjtJQUVuQixJQUFJLFNBQVMsS0FBSyxHQUFHLEVBQUU7UUFDckIsTUFBTSxDQUFDLElBQUksQ0FBQztZQUNWLElBQUksRUFBRSxhQUFhO1lBQ25CLEtBQUssRUFBRSxPQUFPO1lBQ2QsTUFBTSxFQUFFLFVBQVUsS0FBSyxhQUFhO1lBQ3BDLEdBQUcsVUFBVTtTQUNkLENBQUMsQ0FBQztLQUNKO0FBQ0gsQ0FBQztBQUVELE1BQU0sT0FBTyxZQUFZO0lBU3ZCO1FBTkEsYUFBUSxHQUFHLEVBQUUsQ0FBQztRQU9aLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNkLENBQUM7SUFORCxJQUFJLEtBQUs7UUFDUCxPQUFPLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxLQUFLLENBQUM7SUFDckMsQ0FBQztJQU9ELElBQUk7UUFDRixJQUFJLENBQUMsUUFBUSxHQUFHLFVBQVUsQ0FBQyxHQUFHLEVBQXFCLENBQUM7SUFDdEQsQ0FBQztJQUVELG9CQUFvQixDQUFDLElBQVksRUFBRSxLQUFhO1FBQzlDLE1BQU0sb0JBQW9CLEdBQ3hCLENBQUMsS0FBSyxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1FBQ3BGLE1BQU0sTUFBTSxHQUFHLGtCQUFrQixDQUFDLG9CQUFvQixFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNyRSxPQUFPO1lBQ0wsR0FBRyxNQUFNO1lBQ1QsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDO1lBQ2pELE1BQU0sRUFBRSxNQUFNLENBQUMsTUFBTSxJQUFJLE1BQU07U0FDaEMsQ0FBQztJQUNKLENBQUM7SUFFRCxTQUFTLENBQUMsSUFBWTtRQUNwQixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2pDLENBQUM7SUFFRCxLQUFLLENBQUMsV0FBVyxDQUFDLElBQVksRUFBRSxLQUFhO1FBQzNDLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbEMsOEJBQThCO1FBQzlCLElBQUksQ0FBQyxNQUFNLElBQUksT0FBTyxNQUFNLEtBQUssV0FBVyxFQUFFO1lBQzVDLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDM0QsSUFBSSxXQUFXLEVBQUU7Z0JBQ2YsSUFBSTtvQkFDRixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7b0JBQy9ELElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDO29CQUM5QixNQUFNLEdBQUcsTUFBTSxPQUFPLENBQUM7b0JBQ3ZCLFdBQVcsQ0FBQyxHQUFHLEVBQUU7d0JBQ2YsSUFBSSxNQUFNLEVBQUU7NEJBQ1YsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO3lCQUNqQztvQkFDSCxDQUFDLENBQUMsQ0FBQztpQkFDSjt3QkFBUztvQkFDUixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQzVCO2FBQ0Y7U0FDRjtRQUNELE9BQU8sTUFBTSxDQUFDO0lBQ2hCLENBQUM7SUFFRCx1QkFBdUI7SUFDdkIsYUFBYSxDQUFDLElBQVksRUFBRSxLQUFhO1FBQ3ZDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDcEMsSUFBSSxNQUFNLEVBQUU7WUFDVixNQUFNLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxhQUFhLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsR0FBRyxNQUFNLENBQUM7WUFDdkYsTUFBTSxZQUFZLEdBQWlCO2dCQUNqQyxTQUFTLEVBQUU7b0JBQ1QsSUFBSSxFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQztpQkFDcEQ7Z0JBQ0QsVUFBVSxFQUFFLFVBQVU7Z0JBQ3RCLGNBQWMsRUFBRSxJQUFJO2dCQUNwQixlQUFlLEVBQUUsS0FBSzthQUN2QixDQUFDO1lBQ0YsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRTtnQkFDdEQsWUFBWSxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7YUFDN0M7aUJBQU07Z0JBQ0wsWUFBWSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7YUFDN0I7WUFDRCxJQUFJLFFBQVEsS0FBSyxHQUFHLElBQUksYUFBYSxJQUFJLE9BQU8sRUFBRTtnQkFDaEQsWUFBWSxDQUFDLFdBQVcsR0FBRyxhQUFhLENBQUM7Z0JBQ3pDLFlBQVksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO2FBQ2hDO1lBRUQsSUFBSSxRQUFRLElBQUksUUFBUSxDQUFDLE1BQU0sRUFBRTtnQkFDL0IsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxRQUFRO3FCQUNoQyxJQUFJLENBQ0gsQ0FBQyxFQUFFLHNCQUFzQixFQUFFLEVBQUUsRUFBRSxzQkFBc0IsRUFBRSx1QkFBdUIsRUFBRSxFQUFFLEVBQUUsQ0FDbEYsc0JBQXNCLEdBQUcsdUJBQXVCLENBQ25EO3FCQUNBLE1BQU0sQ0FDTCxDQUFDLEdBQUcsRUFBRSxVQUFVLEVBQUUsRUFBRTtvQkFDbEIsc0JBQXNCLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQztvQkFDL0MsaUJBQWlCLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUM7b0JBQ3RELE9BQU8sR0FBRyxDQUFDO2dCQUNiLENBQUMsRUFDRCxFQUFFLE1BQU0sRUFBRSxFQUFrQixFQUFFLE1BQU0sRUFBRSxFQUFrQixFQUFFLENBQzNELENBQUM7Z0JBQ0osSUFBSSxNQUFNLENBQUMsTUFBTSxFQUFFO29CQUNqQixZQUFZLENBQUMsV0FBVyxHQUFHLE1BQU0sQ0FBQztpQkFDbkM7Z0JBQ0QsSUFBSSxNQUFNLENBQUMsTUFBTSxFQUFFO29CQUNqQixZQUFZLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztpQkFDOUI7YUFDRjtZQUNELE9BQU8sSUFBSSxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7U0FDbEM7UUFDRCxPQUFPLENBQUMsS0FBSyxFQUFFLGFBQWEsSUFBSSxpQkFBaUIsQ0FBQyxDQUFDO1FBQ25ELE9BQU8sU0FBUyxDQUFDO0lBQ25CLENBQUM7SUFFRCxZQUFZLENBQUMsSUFBWSxFQUFFLEtBQWE7UUFDdEMsTUFBTSxZQUFZLEdBQUcsQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUN2RixJQUFJLE9BQU8sWUFBWSxLQUFLLFVBQVUsRUFBRTtZQUN0QyxPQUFPLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUMzQjtRQUNELE9BQU8sWUFBc0IsQ0FBQztJQUNoQyxDQUFDO0lBRUQsbUJBQW1CLENBQUMsSUFBWSxFQUFFLEtBQWEsRUFBRSxNQUFrQjtRQUNqRSxPQUFPLENBQUMsS0FBeUIsRUFBRSxFQUFFO1lBQ25DLE1BQU0sbUJBQW1CLEdBQ3ZCLENBQUMsS0FBSyxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1lBQ2xGLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztZQUN6RCxNQUFNLFdBQVcsR0FBRyxrQkFBa0IsQ0FBQyxtQkFBbUIsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxXQUFXLENBQUMsQ0FBQztZQUM5RixPQUFPO2dCQUNMLEdBQUcsV0FBVztnQkFDZCxHQUFHLEVBQUUsV0FBVyxDQUFDLEdBQUcsSUFBSSxXQUFXO2dCQUNuQyxNQUFNLEVBQUUsV0FBVyxDQUFDLE1BQU0sSUFBSSxNQUFNO2FBQ3JDLENBQUM7UUFDSixDQUFDLENBQUM7SUFDSixDQUFDO0lBRUQsV0FBVyxDQUFDLElBQVksRUFBRSxLQUF3QixFQUFFLEtBQXlCO1FBQzNFLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDcEMsSUFBSSxNQUFNLEVBQUU7WUFDVixNQUFNLEVBQUUsU0FBUyxFQUFFLEdBQUcsTUFBTSxDQUFDO1lBQzdCLElBQUksU0FBUyxFQUFFO2dCQUNiLE9BQU8sU0FBUyxDQUFDO2FBQ2xCO1NBQ0Y7UUFFRCxNQUFNLFdBQVcsR0FBRyxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDLElBQUksU0FBUyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBRXBGLElBQUksT0FBTyxXQUFXLEtBQUssVUFBVSxFQUFFO1lBQ3JDLE9BQU8sV0FBVyxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7U0FDekM7UUFDRCxPQUFPLFdBQXFCLENBQUM7SUFDL0IsQ0FBQztJQUdELFVBQVUsQ0FBQyxLQUFnQjtRQUN6QixJQUFJLEtBQUssRUFBRTtZQUNULEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ25CLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzdCLENBQUMsQ0FBQyxDQUFDO1NBQ0o7YUFBTTtZQUNMLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUM7U0FDdkI7SUFDSCxDQUFDO0NBQ0Y7QUExSmE7SUFBWCxVQUFVOzhDQUE0QztBQWF2RDtJQURDLE1BQU07d0NBR047QUFrSUQ7SUFEQyxNQUFNOzhDQVNOO0FBR0gsZUFBZSxJQUFJLFlBQVksRUFBRSxDQUFDIiwibmFtZXMiOltdLCJzb3VyY2VzIjpbIi9Vc2Vycy9odWlodWF3ay9Eb2N1bWVudHMvb3B0L2Nob2Vyb2Rvbi11aS9jb21wb25lbnRzLXByby9zdG9yZXMvTG92Q29kZVN0b3JlLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgaXNOaWwgZnJvbSAnbG9kYXNoL2lzTmlsJztcbmltcG9ydCB7IGFjdGlvbiwgb2JzZXJ2YWJsZSwgT2JzZXJ2YWJsZU1hcCwgcnVuSW5BY3Rpb24gfSBmcm9tICdtb2J4JztcbmltcG9ydCB7IEF4aW9zSW5zdGFuY2UsIEF4aW9zUmVxdWVzdENvbmZpZyB9IGZyb20gJ2F4aW9zJztcbmltcG9ydCB7IGdldENvbmZpZyB9IGZyb20gJ2Nob2Vyb2Rvbi11aS9saWIvY29uZmlndXJlJztcbmltcG9ydCB3YXJuaW5nIGZyb20gJ2Nob2Vyb2Rvbi11aS9saWIvX3V0aWwvd2FybmluZyc7XG5pbXBvcnQgRGF0YVNldCwgeyBEYXRhU2V0UHJvcHMgfSBmcm9tICcuLi9kYXRhLXNldC9EYXRhU2V0JztcbmltcG9ydCBheGlvcyBmcm9tICcuLi9heGlvcyc7XG5pbXBvcnQgRmllbGQsIHsgRmllbGRQcm9wcyB9IGZyb20gJy4uL2RhdGEtc2V0L0ZpZWxkJztcbmltcG9ydCB7IEZpZWxkVHlwZSB9IGZyb20gJy4uL2RhdGEtc2V0L2VudW0nO1xuaW1wb3J0IHsgTG92RmllbGRUeXBlIH0gZnJvbSAnLi4vbG92L2VudW0nO1xuaW1wb3J0IHsgTG92Q29uZmlnLCBMb3ZDb25maWdJdGVtIH0gZnJvbSAnLi4vbG92L0xvdic7XG5pbXBvcnQgeyBwcm9jZXNzQXhpb3NDb25maWcgfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7IFRyYW5zcG9ydEhvb2tQcm9wcyB9IGZyb20gJy4uL2RhdGEtc2V0L1RyYW5zcG9ydCc7XG5cbmZ1bmN0aW9uIGdldEZpZWxkVHlwZShjb25kaXRpb25GaWVsZFR5cGU/OiBGaWVsZFR5cGUgfCBMb3ZGaWVsZFR5cGUpOiBGaWVsZFR5cGUge1xuICBzd2l0Y2ggKGNvbmRpdGlvbkZpZWxkVHlwZSkge1xuICAgIGNhc2UgTG92RmllbGRUeXBlLklOVDpcbiAgICAgIHJldHVybiBGaWVsZFR5cGUubnVtYmVyO1xuICAgIGNhc2UgTG92RmllbGRUeXBlLlRFWFQ6XG4gICAgICByZXR1cm4gRmllbGRUeXBlLnN0cmluZztcbiAgICBjYXNlIExvdkZpZWxkVHlwZS5EQVRFOlxuICAgICAgcmV0dXJuIEZpZWxkVHlwZS5kYXRlO1xuICAgIGNhc2UgTG92RmllbGRUeXBlLkRBVEVUSU1FOlxuICAgICAgcmV0dXJuIEZpZWxkVHlwZS5kYXRlVGltZTtcbiAgICBjYXNlIExvdkZpZWxkVHlwZS5QT1BVUDpcbiAgICAgIHJldHVybiBGaWVsZFR5cGUub2JqZWN0O1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gKGNvbmRpdGlvbkZpZWxkVHlwZSBhcyBGaWVsZFR5cGUpIHx8IEZpZWxkVHlwZS5zdHJpbmc7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2VuZXJhdGVDb25kaXRpb25GaWVsZChcbiAgZmllbGRzOiBGaWVsZFByb3BzW10sXG4gIHtcbiAgICBjb25kaXRpb25GaWVsZCxcbiAgICBjb25kaXRpb25GaWVsZFR5cGUsXG4gICAgY29uZGl0aW9uRmllbGROYW1lLFxuICAgIGdyaWRGaWVsZE5hbWUsXG4gICAgZGlzcGxheSxcbiAgICBjb25kaXRpb25GaWVsZExvdkNvZGUsXG4gICAgY29uZGl0aW9uRmllbGRTZWxlY3RDb2RlLFxuICAgIGNvbmRpdGlvbkZpZWxkU2VsZWN0VXJsLFxuICAgIGNvbmRpdGlvbkZpZWxkU2VsZWN0VGYsXG4gICAgY29uZGl0aW9uRmllbGRTZWxlY3RWZixcbiAgICBjb25kaXRpb25GaWVsZFJlcXVpcmVkLFxuICAgIGZpZWxkUHJvcHMsXG4gIH06IExvdkNvbmZpZ0l0ZW0sXG4pOiB2b2lkIHtcbiAgaWYgKGNvbmRpdGlvbkZpZWxkID09PSAnWScpIHtcbiAgICBjb25zdCBuYW1lID0gY29uZGl0aW9uRmllbGROYW1lIHx8IGdyaWRGaWVsZE5hbWU7XG4gICAgY29uc3QgZmllbGQgPSB7XG4gICAgICBuYW1lLFxuICAgICAgdHlwZTogZ2V0RmllbGRUeXBlKGNvbmRpdGlvbkZpZWxkVHlwZSksXG4gICAgICBsYWJlbDogZGlzcGxheSxcbiAgICAgIGxvdkNvZGU6IGNvbmRpdGlvbkZpZWxkTG92Q29kZSB8fCB1bmRlZmluZWQsXG4gICAgICBsb29rdXBDb2RlOiBjb25kaXRpb25GaWVsZFNlbGVjdENvZGUgfHwgdW5kZWZpbmVkLFxuICAgICAgbG9va3VwVXJsOiBjb25kaXRpb25GaWVsZFNlbGVjdFVybCB8fCB1bmRlZmluZWQsXG4gICAgICB0ZXh0RmllbGQ6IGNvbmRpdGlvbkZpZWxkU2VsZWN0VGYgfHwgdW5kZWZpbmVkLFxuICAgICAgdmFsdWVGaWVsZDogY29uZGl0aW9uRmllbGRTZWxlY3RWZiB8fCB1bmRlZmluZWQsXG4gICAgICByZXF1aXJlZDogY29uZGl0aW9uRmllbGRSZXF1aXJlZCB8fCB1bmRlZmluZWQsXG4gICAgICAuLi5maWVsZFByb3BzLFxuICAgIH07XG4gICAgZmllbGRzLnB1c2goZmllbGQpO1xuICAgIGlmIChjb25kaXRpb25GaWVsZFR5cGUgPT09IExvdkZpZWxkVHlwZS5QT1BVUCkge1xuICAgICAgY29uc3QgYWxpYXNOYW1lID0gYF9fbG92X18ke25hbWV9YDtcbiAgICAgIGZpZWxkLm5hbWUgPSBhbGlhc05hbWU7XG4gICAgICBmaWVsZHMucHVzaCh7XG4gICAgICAgIG5hbWUsXG4gICAgICAgIGJpbmQ6IGAke2FsaWFzTmFtZX0uJHtjb25kaXRpb25GaWVsZFNlbGVjdFZmfWAsXG4gICAgICB9KTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2VuZXJhdGVHcmlkRmllbGQoXG4gIGZpZWxkczogRmllbGRQcm9wc1tdLFxuICB7IGdyaWRGaWVsZCwgZ3JpZEZpZWxkTmFtZSwgZGlzcGxheSwgZmllbGRQcm9wcyB9OiBMb3ZDb25maWdJdGVtLFxuICB2YWx1ZUZpZWxkPzogc3RyaW5nLFxuKTogdm9pZCB7XG4gIGlmIChncmlkRmllbGQgPT09ICdZJykge1xuICAgIGZpZWxkcy5wdXNoKHtcbiAgICAgIG5hbWU6IGdyaWRGaWVsZE5hbWUsXG4gICAgICBsYWJlbDogZGlzcGxheSxcbiAgICAgIHVuaXF1ZTogdmFsdWVGaWVsZCA9PT0gZ3JpZEZpZWxkTmFtZSxcbiAgICAgIC4uLmZpZWxkUHJvcHMsXG4gICAgfSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIExvdkNvZGVTdG9yZSB7XG4gIEBvYnNlcnZhYmxlIGxvdkNvZGVzOiBPYnNlcnZhYmxlTWFwPHN0cmluZywgTG92Q29uZmlnPjtcblxuICBwZW5kaW5ncyA9IHt9O1xuXG4gIGdldCBheGlvcygpOiBBeGlvc0luc3RhbmNlIHtcbiAgICByZXR1cm4gZ2V0Q29uZmlnKCdheGlvcycpIHx8IGF4aW9zO1xuICB9XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5pbml0KCk7XG4gIH1cblxuICBAYWN0aW9uXG4gIGluaXQoKSB7XG4gICAgdGhpcy5sb3ZDb2RlcyA9IG9ic2VydmFibGUubWFwPHN0cmluZywgTG92Q29uZmlnPigpO1xuICB9XG5cbiAgZ2V0RGVmaW5lQXhpb3NDb25maWcoY29kZTogc3RyaW5nLCBmaWVsZD86IEZpZWxkKTogQXhpb3NSZXF1ZXN0Q29uZmlnIHwgdW5kZWZpbmVkIHtcbiAgICBjb25zdCBsb3ZEZWZpbmVBeGlvc0NvbmZpZyA9XG4gICAgICAoZmllbGQgJiYgZmllbGQuZ2V0KCdsb3ZEZWZpbmVBeGlvc0NvbmZpZycpKSB8fCBnZXRDb25maWcoJ2xvdkRlZmluZUF4aW9zQ29uZmlnJyk7XG4gICAgY29uc3QgY29uZmlnID0gcHJvY2Vzc0F4aW9zQ29uZmlnKGxvdkRlZmluZUF4aW9zQ29uZmlnLCBjb2RlLCBmaWVsZCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLmNvbmZpZyxcbiAgICAgIHVybDogY29uZmlnLnVybCB8fCB0aGlzLmdldENvbmZpZ1VybChjb2RlLCBmaWVsZCksXG4gICAgICBtZXRob2Q6IGNvbmZpZy5tZXRob2QgfHwgJ3Bvc3QnLFxuICAgIH07XG4gIH1cblxuICBnZXRDb25maWcoY29kZTogc3RyaW5nKTogTG92Q29uZmlnIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5sb3ZDb2Rlcy5nZXQoY29kZSk7XG4gIH1cblxuICBhc3luYyBmZXRjaENvbmZpZyhjb2RlOiBzdHJpbmcsIGZpZWxkPzogRmllbGQpOiBQcm9taXNlPExvdkNvbmZpZyB8IHVuZGVmaW5lZD4ge1xuICAgIGxldCBjb25maWcgPSB0aGlzLmdldENvbmZpZyhjb2RlKTtcbiAgICAvLyBTU1IgZG8gbm90IGZldGNoIHRoZSBsb29rdXBcbiAgICBpZiAoIWNvbmZpZyAmJiB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgY29uc3QgYXhpb3NDb25maWcgPSB0aGlzLmdldERlZmluZUF4aW9zQ29uZmlnKGNvZGUsIGZpZWxkKTtcbiAgICAgIGlmIChheGlvc0NvbmZpZykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IHBlbmRpbmcgPSB0aGlzLnBlbmRpbmdzW2NvZGVdIHx8IHRoaXMuYXhpb3MoYXhpb3NDb25maWcpO1xuICAgICAgICAgIHRoaXMucGVuZGluZ3NbY29kZV0gPSBwZW5kaW5nO1xuICAgICAgICAgIGNvbmZpZyA9IGF3YWl0IHBlbmRpbmc7XG4gICAgICAgICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgICAgICAgaWYgKGNvbmZpZykge1xuICAgICAgICAgICAgICB0aGlzLmxvdkNvZGVzLnNldChjb2RlLCBjb25maWcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgIGRlbGV0ZSB0aGlzLnBlbmRpbmdzW2NvZGVdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjb25maWc7XG4gIH1cblxuICAvLyBsb3ZDb2RlIOS9nOS4umtleSDnvJPlrZjkuoYgZHNcbiAgZ2V0TG92RGF0YVNldChjb2RlOiBzdHJpbmcsIGZpZWxkPzogRmllbGQpOiBEYXRhU2V0IHwgdW5kZWZpbmVkIHtcbiAgICBjb25zdCBjb25maWcgPSB0aGlzLmdldENvbmZpZyhjb2RlKTtcbiAgICBpZiAoY29uZmlnKSB7XG4gICAgICBjb25zdCB7IGxvdlBhZ2VTaXplLCBsb3ZJdGVtcywgcGFyZW50SWRGaWVsZCwgaWRGaWVsZCwgdmFsdWVGaWVsZCwgdHJlZUZsYWcgfSA9IGNvbmZpZztcbiAgICAgIGNvbnN0IGRhdGFTZXRQcm9wczogRGF0YVNldFByb3BzID0ge1xuICAgICAgICB0cmFuc3BvcnQ6IHtcbiAgICAgICAgICByZWFkOiB0aGlzLmdldFF1ZXJ5QXhpb3NDb25maWcoY29kZSwgZmllbGQsIGNvbmZpZyksXG4gICAgICAgIH0sXG4gICAgICAgIHByaW1hcnlLZXk6IHZhbHVlRmllbGQsXG4gICAgICAgIGNhY2hlU2VsZWN0aW9uOiB0cnVlLFxuICAgICAgICBhdXRvTG9jYXRlRmlyc3Q6IGZhbHNlLFxuICAgICAgfTtcbiAgICAgIGlmICghaXNOaWwobG92UGFnZVNpemUpICYmICFpc05hTihOdW1iZXIobG92UGFnZVNpemUpKSkge1xuICAgICAgICBkYXRhU2V0UHJvcHMucGFnZVNpemUgPSBOdW1iZXIobG92UGFnZVNpemUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGF0YVNldFByb3BzLnBhZ2luZyA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgaWYgKHRyZWVGbGFnID09PSAnWScgJiYgcGFyZW50SWRGaWVsZCAmJiBpZEZpZWxkKSB7XG4gICAgICAgIGRhdGFTZXRQcm9wcy5wYXJlbnRGaWVsZCA9IHBhcmVudElkRmllbGQ7XG4gICAgICAgIGRhdGFTZXRQcm9wcy5pZEZpZWxkID0gaWRGaWVsZDtcbiAgICAgIH1cblxuICAgICAgaWYgKGxvdkl0ZW1zICYmIGxvdkl0ZW1zLmxlbmd0aCkge1xuICAgICAgICBjb25zdCB7IHF1ZXJ5cywgZmllbGRzIH0gPSBsb3ZJdGVtc1xuICAgICAgICAgIC5zb3J0KFxuICAgICAgICAgICAgKHsgY29uZGl0aW9uRmllbGRTZXF1ZW5jZSB9LCB7IGNvbmRpdGlvbkZpZWxkU2VxdWVuY2U6IGNvbmRpdGlvbkZpZWxkU2VxdWVuY2UyIH0pID0+XG4gICAgICAgICAgICAgIGNvbmRpdGlvbkZpZWxkU2VxdWVuY2UgLSBjb25kaXRpb25GaWVsZFNlcXVlbmNlMixcbiAgICAgICAgICApXG4gICAgICAgICAgLnJlZHVjZShcbiAgICAgICAgICAgIChvYmosIGNvbmZpZ0l0ZW0pID0+IHtcbiAgICAgICAgICAgICAgZ2VuZXJhdGVDb25kaXRpb25GaWVsZChvYmoucXVlcnlzLCBjb25maWdJdGVtKTtcbiAgICAgICAgICAgICAgZ2VuZXJhdGVHcmlkRmllbGQob2JqLmZpZWxkcywgY29uZmlnSXRlbSwgdmFsdWVGaWVsZCk7XG4gICAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgeyBxdWVyeXM6IFtdIGFzIEZpZWxkUHJvcHNbXSwgZmllbGRzOiBbXSBhcyBGaWVsZFByb3BzW10gfSxcbiAgICAgICAgICApO1xuICAgICAgICBpZiAocXVlcnlzLmxlbmd0aCkge1xuICAgICAgICAgIGRhdGFTZXRQcm9wcy5xdWVyeUZpZWxkcyA9IHF1ZXJ5cztcbiAgICAgICAgfVxuICAgICAgICBpZiAoZmllbGRzLmxlbmd0aCkge1xuICAgICAgICAgIGRhdGFTZXRQcm9wcy5maWVsZHMgPSBmaWVsZHM7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgRGF0YVNldChkYXRhU2V0UHJvcHMpO1xuICAgIH1cbiAgICB3YXJuaW5nKGZhbHNlLCBgTE9WOiBjb2RlPCR7Y29kZX0+IGlzIG5vdCBleGlzdHNgKTtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgZ2V0Q29uZmlnVXJsKGNvZGU6IHN0cmluZywgZmllbGQ/OiBGaWVsZCk6IHN0cmluZyB7XG4gICAgY29uc3QgbG92RGVmaW5lVXJsID0gKGZpZWxkICYmIGZpZWxkLmdldCgnbG92RGVmaW5lVXJsJykpIHx8IGdldENvbmZpZygnbG92RGVmaW5lVXJsJyk7XG4gICAgaWYgKHR5cGVvZiBsb3ZEZWZpbmVVcmwgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiBsb3ZEZWZpbmVVcmwoY29kZSk7XG4gICAgfVxuICAgIHJldHVybiBsb3ZEZWZpbmVVcmwgYXMgc3RyaW5nO1xuICB9XG5cbiAgZ2V0UXVlcnlBeGlvc0NvbmZpZyhjb2RlOiBzdHJpbmcsIGZpZWxkPzogRmllbGQsIGNvbmZpZz86IExvdkNvbmZpZykge1xuICAgIHJldHVybiAocHJvcHM6IFRyYW5zcG9ydEhvb2tQcm9wcykgPT4ge1xuICAgICAgY29uc3QgbG92UXVlcnlBeGlvc0NvbmZpZyA9XG4gICAgICAgIChmaWVsZCAmJiBmaWVsZC5nZXQoJ2xvdlF1ZXJ5QXhpb3NDb25maWcnKSkgfHwgZ2V0Q29uZmlnKCdsb3ZRdWVyeUF4aW9zQ29uZmlnJyk7XG4gICAgICBjb25zdCBsb3ZRdWVyeVVybCA9IHRoaXMuZ2V0UXVlcnlVcmwoY29kZSwgZmllbGQsIHByb3BzKTtcbiAgICAgIGNvbnN0IGF4aW9zQ29uZmlnID0gcHJvY2Vzc0F4aW9zQ29uZmlnKGxvdlF1ZXJ5QXhpb3NDb25maWcsIGNvZGUsIGNvbmZpZywgcHJvcHMsIGxvdlF1ZXJ5VXJsKTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLmF4aW9zQ29uZmlnLFxuICAgICAgICB1cmw6IGF4aW9zQ29uZmlnLnVybCB8fCBsb3ZRdWVyeVVybCxcbiAgICAgICAgbWV0aG9kOiBheGlvc0NvbmZpZy5tZXRob2QgfHwgJ3Bvc3QnLFxuICAgICAgfTtcbiAgICB9O1xuICB9XG5cbiAgZ2V0UXVlcnlVcmwoY29kZTogc3RyaW5nLCBmaWVsZDogRmllbGQgfCB1bmRlZmluZWQsIHByb3BzOiBUcmFuc3BvcnRIb29rUHJvcHMpOiBzdHJpbmcge1xuICAgIGNvbnN0IGNvbmZpZyA9IHRoaXMuZ2V0Q29uZmlnKGNvZGUpO1xuICAgIGlmIChjb25maWcpIHtcbiAgICAgIGNvbnN0IHsgY3VzdG9tVXJsIH0gPSBjb25maWc7XG4gICAgICBpZiAoY3VzdG9tVXJsKSB7XG4gICAgICAgIHJldHVybiBjdXN0b21Vcmw7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgbG92UXVlcnlVcmwgPSAoZmllbGQgJiYgZmllbGQuZ2V0KCdsb3ZRdWVyeVVybCcpKSB8fCBnZXRDb25maWcoJ2xvdlF1ZXJ5VXJsJyk7XG5cbiAgICBpZiAodHlwZW9mIGxvdlF1ZXJ5VXJsID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gbG92UXVlcnlVcmwoY29kZSwgY29uZmlnLCBwcm9wcyk7XG4gICAgfVxuICAgIHJldHVybiBsb3ZRdWVyeVVybCBhcyBzdHJpbmc7XG4gIH1cblxuICBAYWN0aW9uXG4gIGNsZWFyQ2FjaGUoY29kZXM/OiBzdHJpbmdbXSkge1xuICAgIGlmIChjb2Rlcykge1xuICAgICAgY29kZXMuZm9yRWFjaChjb2RlID0+IHtcbiAgICAgICAgdGhpcy5sb3ZDb2Rlcy5kZWxldGUoY29kZSk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5sb3ZDb2Rlcy5jbGVhcigpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBuZXcgTG92Q29kZVN0b3JlKCk7XG4iXSwidmVyc2lvbiI6M30=