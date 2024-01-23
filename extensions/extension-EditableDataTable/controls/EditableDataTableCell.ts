
import { IObservable } from 'modules/mdk-core/observables/IObservable';
import { IControl } from 'mdk-core/controls/IControl';
import { Context } from 'mdk-core/context/Context';
import { ControlProxy } from 'mdk-core/context/ClientAPI';
import { IClientAPI } from 'mdk-core/context/IClientAPI';

class EDTContext extends Context {
    private _EDTClientAPI: IClientAPI;

    public get clientAPI(): IClientAPI {
        this._EDTClientAPI = this._EDTClientAPI ? this._EDTClientAPI : new ControlProxy(this);
        return this._EDTClientAPI;
    }
}

export class EditableDataTableCell extends IControl {
    static readonly VALUE = 'Value';
    static readonly DISPLAY_VALUE = 'DisplayValue';
    static readonly LIST_PICKER = 'ListPicker';
    static readonly UPDATE_CELL = 'UpdateCell';
    static readonly APPLY_VALIDATION = 'ApplyValidation';
    static readonly CLEAR_VALIDATION = 'ClearValidation';

    private _table: any;
    private _row: any;
    private _column: any;
    private _cell: any;
    private _isError: boolean;
    private _isModified: boolean;

    observable(): IObservable {
        throw new Error('Method not implemented.');
    }

    setContainer(container: IControl) {}

    view() {
        return null;
    }

    setValue(value: any, notify: boolean, isTextValue?: boolean): Promise<any> {
        this.setIsModified(true);
        return this.setParameter(EditableDataTableCell.VALUE, value);
    }

    getValue() {
        return this.getParameter(EditableDataTableCell.VALUE);
    }

    setDisplayValue(displayValue: any) {
        if (this._cell.Type === EditableDataTableCell.LIST_PICKER) {
            return this.setParameter(EditableDataTableCell.DISPLAY_VALUE, displayValue);
        }
    }

    getDisplayValue() {
        return this._cell.Type === EditableDataTableCell.LIST_PICKER ? this.getParameter(EditableDataTableCell.DISPLAY_VALUE) : undefined;
    }

    setStyle(style: any) {
        this._cell.Style = style;
        this._table.sendCallback({ Row: this._row, Column: this._column, Cell: this._cell }, EditableDataTableCell.UPDATE_CELL);
    }

    getStyle() {
        return this._cell.Style;
    }

    setEditable(isEditable: boolean) {
        this._cell.IsReadOnly = !isEditable;
        this._table.sendCallback({ Row: this._row, Column: this._column, Cell: this._cell }, EditableDataTableCell.UPDATE_CELL);
    }

    getEditable() {
        return !this._cell.IsReadOnly ? false : !this._cell.IsReadOnly;
    }

    getRow() {
        return this._row;
    }

    getColumn() {
        return this._column;
    }

    getProperty() {
        return this._cell.Property;
    }

    getName() {
        return this._cell.Name;
    }

    getTable() {
        return this._table;
    }

    setCell(cell: any) {
        this._cell = cell;
    }

    setIsModified(isModified: boolean) {
        this._isModified = isModified;
    }

    isModified() {
        return this._isModified;
    }

    applyValidation(validationMessage: string) {
        this._isError = true;
        this._table.sendCallback({ Row: this._row, Column: this._column, ValidationMessage: validationMessage }, EditableDataTableCell.APPLY_VALIDATION);
    }

    clearValidation() {
        if (this._isError) {
            this._table.sendCallback({ Row: this._row, Column: this._column }, EditableDataTableCell.CLEAR_VALIDATION);
            this._isError = false;
        }
    }

    private setParameter(key: any, value: any): Promise<any> {
        let parameters = this._cell.Parameters;
        if (typeof(parameters) == 'string') {
            const json = JSON.parse(parameters);
            json[key] = value;
            this._cell.Parameters = JSON.stringify(json);
        } else {
            this._cell.Parameters[key] = value;
        }
        this._table.sendCallback({ Row: this._row, Column: this._column, Cell: this._cell }, EditableDataTableCell.UPDATE_CELL);
        return Promise.resolve();
    }

    private getParameter(key: any) {
        const parameters = this._cell.Parameters;
        if (parameters) {
            if (typeof(parameters) == 'string') {
                return JSON.parse(parameters)[key];
            }
            return parameters[key];
        }
        return undefined;
    }

    constructor(parent: any, row: number, column: number, binding: any, cell: any) {
        super();
        this._table = parent;
        this._row = row;
        this._column = column;
        this._cell = cell;
        this.context = new EDTContext(binding, this);
    }
}
