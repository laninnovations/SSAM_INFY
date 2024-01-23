declare var com;

@NativeClass()
@Interfaces([com.sap.sam.android.plugin.editable_data_table.IEditableDataTableDelegate])
class EditableDataTableControlDelegate extends java.lang.Object {

    private _controlExtension: any;

    public static initWithExtension(controlExtension): EditableDataTableControlDelegate {
        let controlDelegate = new EditableDataTableControlDelegate();
        controlDelegate._controlExtension = controlExtension;
        return controlDelegate;
    }

    public setControlExtension(controlExtension) {
        this._controlExtension = controlExtension;
    }

    public onCreate() {
        this._controlExtension.onCreate();
    }

    public paginateListPicker(target, currentPage, itemsPerPage) {
        this._controlExtension.paginateListPicker(target, currentPage, itemsPerPage);
    }

    public searchListPicker(target, searchText, currentPage, itemsPerPage) {
        this._controlExtension.searchListPicker(target, searchText, currentPage, itemsPerPage);
    }

    public onValueChange(row, column, cell) {
        this._controlExtension.onValueChange(row, column, cell);
    }

    public onPress(row, column, action) {
        this._controlExtension.onPress(row, column, action);
    }

    public onError(message, isDelay = false): any {
        this._controlExtension.onError(message, isDelay);
    }

    public onCellFocusChange(hasFocus): any {
        this._controlExtension.onCellFocusChange(hasFocus);
    }

    public localizedValue(key, params): any {
        return this._controlExtension.localizedValue(key, params);
    }
}

export { EditableDataTableControlDelegate }
