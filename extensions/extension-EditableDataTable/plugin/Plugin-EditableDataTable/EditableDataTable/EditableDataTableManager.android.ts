import { EditableDataTableControlDelegate } from '../Common/EditableDataTableControlDelegate';
import { EditableDataTableNativeObjects } from './EditableDataTableNativeObjects';
import { View } from '@nativescript/core';

declare var com;

export class EditableDataTableManager extends View {

    public _nativeView: any;
    private _params: any;
    private _delegate: any;
    private _edtManager: any;
    private _edtExtension: any;

    public createNativeView(): Object {
        try {
            this._delegate = EditableDataTableControlDelegate.initWithExtension(this._edtExtension);
            return this._edtManager.createEditableDataTableView(
                    this._context, JSON.stringify(this._params), this._delegate, this.parent.android);
        } catch (error) {
                console.log(error);
            }
        }

    public initNativeView(): void {
        if (this._nativeView) {
            (<any> this._nativeView).owner = this;
        }
        super.initNativeView();
    }

    public disposeNativeView(): void {
        if (this._nativeView) {
            (<any> this._nativeView).owner = null;
        }
        super.disposeNativeView();
    }

    public create(params: any, edtExtension: any): EditableDataTableNativeObjects {
        let manager = new com.sap.sam.android.plugin.editable_data_table.EditableDataTableManager();
        let objects = new EditableDataTableNativeObjects()
        objects.bridge = manager;

        if (edtExtension.androidContext() == null) { // EditableDataTable used as a ExtensionControl
            this._params = params;
            this._edtExtension = edtExtension;
            this._edtManager = manager;
            objects.delegate = this._delegate;
            objects.view = this;
            return objects;
        } else { // EditableDataTable used as a SectionExtension
            this._delegate = EditableDataTableControlDelegate.initWithExtension(edtExtension);
            let view = manager.createEditableDataTableView(edtExtension.androidContext(),
                            JSON.stringify(params), this._delegate, null);
            objects.delegate = this._delegate;
            objects.view = view;
            return objects;
        }
    }
}
