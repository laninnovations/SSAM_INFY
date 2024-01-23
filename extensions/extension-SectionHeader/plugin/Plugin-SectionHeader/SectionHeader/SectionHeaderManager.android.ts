import { SectionHeaderControlDelegate } from '../Common/SectionHeaderControlDelegate';
import { SectionHeaderNativeObjects } from './SectionHeaderNativeObjects';
import { View } from '@nativescript/core';

declare var com;

export class SectionHeaderManager extends View {

    public _nativeView: any;
    private _params: any;
    private _delegate: any;
    private _shManager: any;
    private _shExtension: any;

    public createNativeView(): Object {
        try {
            this._delegate = SectionHeaderControlDelegate.initWithExtension(this._shExtension);
            return this._shManager.createSectionHeaderView(
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

    public create(params: any, shExtension: any): SectionHeaderNativeObjects {
        let manager = new com.sap.sam.android.plugin.section_header.SectionHeaderManager();
        let objects = new SectionHeaderNativeObjects()
        objects.bridge = manager;

        if (shExtension.androidContext() == null) { // SectionHeader used as a ExtensionControl
            this._params = params;
            this._shExtension = shExtension;
            this._shManager = manager;
            objects.delegate = this._delegate;
            objects.view = this;
            return objects;
        } else { // SectionHeader used as a SectionExtension
            this._delegate = SectionHeaderControlDelegate.initWithExtension(shExtension);
            let view = manager.createSectionHeaderView(shExtension.androidContext(),
                            JSON.stringify(params), this._delegate, null);
            objects.delegate = this._delegate;
            objects.view = view;
            return objects;
        }
    }
}
