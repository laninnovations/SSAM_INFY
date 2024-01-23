interface EditableDataTableDelegate extends NSObjectProtocol { // tslint:disable-line
    onCreate?(): void;
    paginateListPickerPagingParams?(target: string, pagingParams: string): void;
    searchListPickerSearchParams?(target: string, searchParams: string): void;
    onValueChange?(params: string): void;
    onPress?(params: string): void;
    onErrorIsDelay?(message: string, isDelay: boolean): void;
    localizedValueParams?(key: string, params: string): string;
}


declare var EditableDataTableDelegate: {
    prototype: EditableDataTableDelegate;
};

@NativeClass()
class EditableDataTableControlDelegate extends NSObject implements EditableDataTableDelegate  {

    public static ObjCProtocols = [EditableDataTableDelegate]; // tslint:disable-line
    
    public static initWithExtension(controlExtension): EditableDataTableControlDelegate {
        let controlDelegate = <EditableDataTableControlDelegate> EditableDataTableControlDelegate.new();
        controlDelegate._controlExtension = controlExtension;
        return controlDelegate;
    }

    private _dataService: any;
    private _bridge: any;
    private _controlExtension: any;

    public setControlExtension(controlExtension) {
        this._controlExtension = controlExtension;
    }

    public onCreate() {
        this._controlExtension.onCreate();
    }

    public paginateListPickerPagingParams(target: string, pagingParams: string): void {
        let params = JSON.parse(pagingParams);
        this._controlExtension.paginateListPicker(target, params.currentPage, params.itemsPerPage);
    }

    public searchListPickerSearchParams(target: string, searchParams: string): void {
        let params = JSON.parse(searchParams);
        this._controlExtension.searchListPicker(target, params.searchText, params.currentPage, params.itemsPerPage);
    }

    public onValueChange(params: string): void {
        let onValueChangeParams = JSON.parse(params);
        let cellJSON = JSON.stringify(onValueChangeParams.cell);
        this._controlExtension.onValueChange(onValueChangeParams.row, onValueChangeParams.column, cellJSON);
    }

    public onPress(params: string): void {
        let onPressParams = JSON.parse(params);
        this._controlExtension.onPress(onPressParams.row, onPressParams.column, onPressParams.action);
    }

    public onErrorIsDelay(message, isDelay = false): void {
        this._controlExtension.onError(message, isDelay);
    }

    public onCellFocusChange(hasFocus): void {
        this._controlExtension.onCellFocusChange(hasFocus);
    }

    public localizedValueParams(key: string, params: string): string {
        return this._controlExtension.localizedValue(key, params);
    }
}

export { EditableDataTableControlDelegate }