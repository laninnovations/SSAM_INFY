import { QuickActionBarControlDelegate } from '../Common/QuickActionBarControlDelegate';
import { QuickActionBarNativeObjects } from './QuickActionBarNativeObjects';
import { View } from '@nativescript/core';
declare var com;

export class QuickActionBarManager extends View {

    public _nativeView: any;
    private _params: any;
    private _delegate: any;
    private _quickActionBarManager: any;
    private _quickActionBarExtension: any;

    public createNativeView(): Object {
        try {
            this._delegate = QuickActionBarControlDelegate.initWithExtension(this._quickActionBarExtension);
            return this._quickActionBarManager.createQuickActionBarView(
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
            // Remove reference from native view to this instance.
            (<any> this._nativeView).owner = null;
        }

        // If you want to recycle _nativeView and have modified the nativeView 
        // without using Property or CssProperty (e.g. outside our property system - 'setNative' callbacks)
        // you have to reset it to its initial state here.
        super.disposeNativeView();
    }

    public create(params: any, qabExtension: any): QuickActionBarNativeObjects {
        let quickActionBarManager = new com.sap.sam.android.plugin.quickactionbar.QuickActionBarManager();
        let objects = new QuickActionBarNativeObjects()
        objects.bridge = quickActionBarManager;

        if (qabExtension.androidContext() == null) { // QuickActionBar used as a ExtensionControl
            this._params = params;
            this._quickActionBarExtension = qabExtension;
            this._quickActionBarManager = quickActionBarManager;
            objects.delegate = this._delegate;
            objects.view = this;
            return objects;
        } else { // QuickActionBar used as a SectionExtension
            this._delegate = QuickActionBarControlDelegate.initWithExtension(qabExtension);
            let view = quickActionBarManager.createQuickActionBarView(
                qabExtension.androidContext(), JSON.stringify(params), this._delegate, null);
            objects.delegate = this._delegate;
            objects.view = view;
            return objects;
        }
    }
};
