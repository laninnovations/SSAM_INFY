import {HierarchyControlDelegate} from '../Common/HierarchyControlDelegate';
import { View } from '@nativescript/core';
declare var com;

export class HierarchyControl extends View {

    public _nativeView: any;
    private _delegate: any;
    private _params: any;
    private _dataService: any;
    private _hierarchyManager: any;
    private _hierarchyExtension: any;

    public createNativeView(): Object {
        try {
            this._delegate = HierarchyControlDelegate.init(
                this._dataService, this._hierarchyManager, this._hierarchyExtension);
            this._hierarchyExtension._delegate = this._delegate;
            return this._hierarchyManager.createHierarchyView(
                this._context, JSON.stringify(this._params), this._delegate);
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

        // If you want to recycle nativeView and have modified the nativeView 
        // without using Property or CssProperty (e.g. outside our property system - 'setNative' callbacks)
        // you have to reset it to its initial state here.
        super.disposeNativeView();
    }

    public create(params, dataService, hierarchyExtension): any {
        let hierarchyManager = new com.sap.sam.android.plugin.hierarchy.HierarchyManager();
        hierarchyExtension._bridge = hierarchyManager;

        if (hierarchyExtension.androidContext() == null) { // Hierarchy used as a ExtensionControl
            // if(!hierarchyExtension.readFromContext()) {
            //    this._fragmentTag = Map.FULL_SCREEN_MAP_FRAGMENT_TAG;
            // }else{
            //    this._fragmentTag = Map.FULL_SCREEN_MAP_MODAL_FRAGMENT_TAG;
            // }
            this._params = params;
            this._dataService = dataService;
            this._hierarchyExtension = hierarchyExtension;
            this._hierarchyManager = hierarchyManager;
            return this;
        } else { // Hierarchy used as a SectionExtension
            this._delegate = HierarchyControlDelegate.init(
                dataService, hierarchyManager, hierarchyExtension);
            hierarchyExtension._delegate = this._delegate;
            return hierarchyManager.createHierarchyView(
                hierarchyExtension.androidContext(), JSON.stringify(params), this._delegate);
        }
    }
};
