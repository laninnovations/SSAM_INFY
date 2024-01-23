import { BaseExtension } from 'extension-Common/BaseExtension';
import { Utils } from 'extension-Common/Utils';
import { NonResolvableObjects } from 'extension-Common/NonResolvableObjects';
import { ValueResolver} from 'mdk-core/utils/ValueResolver';
import { ITargetServiceSpecifier } from 'mdk-core/data/ITargetSpecifier';
import { IDataService } from 'mdk-core/data/IDataService';

import { EditableDataTableCell } from './EditableDataTableCell';
import { EditableDataTableParser } from './EditableDataTableParser';
import { EditableDataTableBridge } from 'extension-EditableDataTable';

export class EditableDataTableExtension extends BaseExtension {
    protected _delegate: any;
    protected _cellMatrix: EditableDataTableCell[][];
    protected _rowBindings: any[];

    public initialize(props) {
        this._parser = new EditableDataTableParser();
        super.initialize(props); 

        let edtBridge: EditableDataTableBridge = new EditableDataTableBridge();
        let nativeObjects = edtBridge.create(this.getParams(), this);
        this._delegate = nativeObjects.delegate;
        this._bridge = nativeObjects.bridge;
        this._cellMatrix = [[],[]];
        this._rowBindings = [];

        this.setViewController(nativeObjects.view);
    }

    public onCreate() {
        let params = this.getParams();
        let namePromises = [];
        let widthPromises = [];
        let dynamicWidthPromises = [];
        let columnList = [];

        params.Columns.forEach((column) => {
            columnList.push({}); // place holder
            column.IsDynamicWidth = (column.IsDynamicWidth === true);
            namePromises.push(ValueResolver.resolveValue(column['HeaderName'], this.context));
            widthPromises.push(ValueResolver.resolveValue(column['PreferredWidth'], this.context));
            dynamicWidthPromises.push(ValueResolver.resolveValue(column['IsDynamicWidth'], this.context));
        });

        Promise.all(namePromises).then(results => {
            for (let i = 0; i < results.length; i++) {
                columnList[i].HeaderName = results[i] ?? "";
            }
            Promise.all(widthPromises).then(results => {
                let columns: {}[] = [];
                for (let i = 0; i < results.length; i++) {
                    columnList[i].PreferredWidth = results[i] ?? 100;
                    columnList[i].Cells = [];
                    columns.push(columnList[i]);
                }
                Promise.all(dynamicWidthPromises).then(results => {
                    for (let i = 0; i < results.length; i++) {
                        columnList[i].IsDynamicWidth = results[i] ?? false;
                    }
                    // Row and Target need to be queried through the database
                    const schema = {
                        Row: Utils.clone(params.Row),
                        Target: Utils.clone(params.Target)
                    };

                    const payload = {
                        'Columns': columns,
                        'NumberOfLeadingStickyColumns': params.Configuration && params.Configuration.NumberOfLeadingStickyColumns ? params.Configuration.NumberOfLeadingStickyColumns : 0,
                        'IsStickyHeaderRow': params.Configuration && params.Configuration.IsStickyHeaderRow ? params.Configuration.IsStickyHeaderRow : true,
                        'MaxLinesPerRow': params.Configuration && params.Configuration.MaxLinesPerRow ? params.Configuration.MaxLinesPerRow : 1
                    };

                    if (params.Target.QueryOptions.includes('.js')) {
                        this.executeActionOrRule(params.Target.QueryOptions, this.context).then(result => {
                            if (result && result.length > 0) {
                                params.Target.QueryOptions = result;
                                this.createTableContent(schema, payload);
                            }
                        });
                    } else {
                        this.createTableContent(schema, payload);
                    }
                });
            });
        });
    }

    public onValueChange(row, column, cell) {
        const json = JSON.parse(cell);

        this._cellMatrix[row][column].setCell(json);
        this._cellMatrix[row][column].setIsModified(true);

        if (json.OnValueChange) {
            this.executeActionOrRule(json.OnValueChange, this._cellMatrix[row][column].context);
        }
    }

    public onPress(row, column, action) {
        if (action) {
            this.executeActionOrRule(action, this._cellMatrix[row][column].context);
        }
    }

    public onError(message, isDelay) {
        if (isDelay) {
            (new Promise(() => {
                setTimeout(() => {
                    this.showErrorBanner(message);
                }, 500);
            }));
        }
        this.showErrorBanner(message);
    }

    public onCellFocusChange(hasFocus) {
        const actionOrRule = hasFocus ? this.getParams().OnCellGetsFocus : this.getParams().OnCellLostFocus;
        if (actionOrRule) {
            this.executeActionOrRule(actionOrRule, this.context);
        }
    }

    public getAllCells() {
        return this._cellMatrix.flat();
    }

    public getRows() {
        return this._cellMatrix;
    }

    public getRowBindings() {
        return this._rowBindings;
    }

    public getRowCells(row) {
        return this._cellMatrix[row];
    }

    public getRowCellByName(row, name) {
        if (row < 0 || row >= this._cellMatrix.length) {
            return undefined;
        }
        for (let i = 0; i < this._cellMatrix[row].length; i++) {
            if (name === this._cellMatrix[row][i].getName()) {
                return this._cellMatrix[row][i];
            }
        }
        return undefined;
    }

    public getCell(row, column) {
        return this._cellMatrix[row][column];
    }

    public getAllValues() {
        return this.getValues(false);
    }

    public getUpdatedValues() {
        return this.getValues(true);
    }

    public applyFilter(filteredRows) {
        this.sendCallback({ FilteredRows: (filteredRows && filteredRows.length > 0) ? filteredRows : [] }, 'ApplyFilter');
    }

    public resetFilter() {
        this.sendCallback({}, 'ResetFilter');
    }

    public paginateListPicker(target: string, currentPage: number, itemsPerPage: number) {
        const callbackType = 'PaginateListPicker';
        let json = JSON.parse(target);

        if (json.Target.QueryOptions.includes('.js')) {
            this.executeActionOrRule(json.Target.QueryOptions, this.context).then(result => {
                if (result && result.length > 0) {
                    json.Target.QueryOptions = result;
                    this.paginateDatabase(json, currentPage, itemsPerPage, callbackType);
                }
            });
        } else {
            this.paginateDatabase(json, currentPage, itemsPerPage, callbackType);
        }
    }

    public searchListPicker(target: string, searchText: string, currentPage: number, itemsPerPage: number) {
        let json = JSON.parse(target);

        if (json.Target.QueryOptions.includes('.js')) {
            this.executeActionOrRule(json.Target.QueryOptions, this.context).then(result => {
                if (result && result.length > 0) {
                    json.Target.QueryOptions = result;
                    this.searchDatabase(json, searchText.toLowerCase(), currentPage, itemsPerPage);
                }
            });
        } else {
            this.searchDatabase(json, searchText.toLowerCase(), currentPage, itemsPerPage);
        }
    }

    public localizedValue(key: string, params: string): any {
        return this._parser.getExtensionLocalizedValue(key, params, this.context);
    }

    public processQueries(queries: Object[], rowBindings = undefined): Promise<any> {
        return this.runQueries(queries, rowBindings).then(results => {
            let arrObjects = [];
            if (results.length > 0) {
                results.forEach(result => {
                    if (result.length > 0) {
                        result.forEach(item => {
                            arrObjects.push(item);
                        });
                    }
               });
            }
            return arrObjects;
        });
    }

    public runQueries(targets, rowBindings): Promise<any> {
        if (targets.length > 0) {
            let aPromises: Promise<any>[] = [];
            return new Promise((resolve, reject) => {
                targets.forEach(item => {
                    let target = Utils.clone(item.Target);
                    delete item.Target;
                    aPromises.push(this.getObjectsWithBinding(item, target, rowBindings));
                });
                return Promise.all(aPromises).then(results => {
                    resolve(results);
                });
            });
        } else {
            return Promise.resolve([]);
        }
    }

    public getObjectsWithBinding(schema, target, rowBindings): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                this.getDataService().read(this.getTargetService(target)).then(result => {
                    let array = [];
                    for (let i = 0; i < result.length; i++) {
                        array.push(result.getItem(i));
                        if (rowBindings) {
                            rowBindings[i] = result.getItem(i);
                        }
                    }
                    this.bindObjects(schema, array).then(objects => {
                        resolve(objects);
                    });
                });
            } catch (error) {
                console.log(error);
            }
        });
    }

    public getTargetService(target): ITargetServiceSpecifier {
        return {
            entitySet: decodeURIComponent(target.EntitySet),
            keyProperties: target.KeyProperties ? target.KeyProperties : [],
            offlineEnabled: true,
            properties: target.Properties ? target.Properties : [],
            queryOptions: decodeURIComponent(target.QueryOptions),
            serviceUrl: IDataService.instance().urlForServiceName(target.Service),
            uniqueIdType: 0,
        };
    }

    public onPageUnloaded(pageExists: boolean) {
        if (!pageExists) {
            // Page is being unloaded and does not exists on the back stack
            // It should be told to drop extra resources
            this._delegate.setControlExtension(undefined);
            this._delegate = undefined;
            this.setViewController(undefined);
            this._bridge = undefined;
        }
    }

    private createTableContent(params, payload) {
        const items = params.Row.Items;
        const onValueChangeObjects = new NonResolvableObjects('OnValueChange');
        const pickerItemsObjects = new NonResolvableObjects('PickerItems');
        const actionObjects = new NonResolvableObjects('Action');

        for (let i = 0; i < items.length; i++) {
            if (typeof(items[i]) === 'object') {
                onValueChangeObjects.cache(items[i], i);
                pickerItemsObjects.cache(items[i].Parameters, i);
                actionObjects.cache(items[i].Parameters, i);
            }
        }

        this.processQueries([params], this._rowBindings).then(results => {
            if (results && results.length > 0) {
                results.forEach((result, i) => {
                    this._cellMatrix[i] = [];
                    for (let j = 0; j < items.length; j++) {
                        if (typeof(items[j]) === 'object') {
                            onValueChangeObjects.restore(result.Row.Items[j], j);
                            pickerItemsObjects.restore(result.Row.Items[j].Parameters, j);
                            actionObjects.restore(result.Row.Items[j].Parameters, j);
                        }
                        if (Utils.isAndroid()) {
                            result.Row.Items[j].Parameters =
                                JSON.stringify(result.Row.Items[j].Parameters);
                        } else if (result.Row.Items[j].Parameters.PickerItems) {
                            result.Row.Items[j].Parameters.PickerItems =
                                JSON.stringify(result.Row.Items[j].Parameters.PickerItems);
                        }
                        payload.Columns[j].Cells.push(result.Row.Items[j]);
                        this._cellMatrix[i][j] = new EditableDataTableCell(
                            this, i, j, this._rowBindings[i], result.Row.Items[j]);
                    }
                });
                this.sendCallback(payload, 'SetTableContent');
                // notify metadata that data were loaded to native
                const onLoaded = this.getParams().OnLoaded;
                if (onLoaded) {
                    this.executeActionOrRule(onLoaded, this.context);
                }
            }
        });
    }

    private searchDatabase(json, searchText, currentPage, itemsPerPage) {
        if (!json.DisplayValue || !json.Target) {
            return;
        }

        const values = json.DisplayValue.match(/\{(.+?)\}/g);

        if (!values || values.length === 0) {
            return;
        }

        let VALUE = (v: string) => {
            return 'substringof(\'' + searchText + '\', tolower(' + v.slice(1, -1) + ')) eq true';
        }

        let i = 0, filter = '(';
        while (i < values.length - 1) {
            filter += VALUE(values[i]) + ' or ';
            i++;
        }

        filter += VALUE(values[i]) + ')';
        json.Target.QueryOptions += (json.Target.QueryOptions.length > 0 ? '&' : '') + '$filter=' + filter;
        this.paginateDatabase(json, currentPage, itemsPerPage, 'SearchListPicker');
    }

    private paginateDatabase(json, currentPage, itemsPerPage, callbackType) {
        json.Target.QueryOptions += (json.Target.QueryOptions.length > 0 ? '&' : '') + '$top=' + itemsPerPage;
        if (currentPage > 0) {
            json.Target.QueryOptions += '&$skip=' + currentPage * itemsPerPage;
        }
        this.processQueries([json]).then(result => {
            if (this._bridge != null) {
                const data = {Values: result};
                this._bridge.callback(Utils.isAndroid() ?
                    JSON.stringify(data) : data, callbackType);
            }
        });
    }

    private getValues(updatedOnly = false) {
        const values = [];
        for (let i = 0; i < this._cellMatrix.length; i++) {
            const properties = {};
            for (let j = 0; j < this._cellMatrix[i].length; j++) {
                const cell = this._cellMatrix[i][j];
                if (updatedOnly) {
                    if (cell.isModified()) {
                        properties[cell.getProperty()] = cell.getValue();
                    }
                } else {
                    properties[cell.getProperty()] = cell.getValue();
                }
            }
            if (Object.entries(properties).length > 0) {
                values.push({
                    Properties: properties,
                    OdataBinding: this._rowBindings[i],
                    RowIndex: i,
                });
            }
        }
        return values;
    }

    private showErrorBanner(message) {
        const prefix = this.localizedValue('error_found', '');
        this.executeAction({
            'Name': '/SAPAssetManager/Actions/ErrorBannerMessage.action',
            'Properties': {
                'Message': prefix + ': ' + message,
            },
        });
    }
}
