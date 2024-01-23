import {DocumentEditorNativeObjects} from './DocumentEditorNativeObjects';
import {DocumentEditorControlDelegate} from '../Common/DocumentEditorControlDelegate';
import { View } from '@nativescript/core';
declare var com;

export class DocumentEditorControl extends View {

    public _nativeView: any;
    private _params: any;
    private _delegate: any;
    private _documentEditorManager: any;
    private _documentEditorExtension: any;

    public createNativeView(): Object {
        try {
            this._delegate = DocumentEditorControlDelegate.initWithExtension(this._documentEditorExtension);
            return this._documentEditorManager.createDocumentEditorView(
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

        // If you want to recycle _nativeView and have modified the _nativeView 
        // without using Property or CssProperty (e.g. outside our property system - 'setNative' callbacks)
        // you have to reset it to its initial state here.
        super.disposeNativeView();
    }

    public create(params: any, extension: any): DocumentEditorNativeObjects {
        let documentEditorManager = new com.sap.sam.android.plugin.documenteditor.DocumentEditorManager();
        let objects = new DocumentEditorNativeObjects()
        objects.bridge = documentEditorManager;

        if (extension.androidContext() == null) { // DocumentEditor used as a ExtensionControl
            this._params = params;
            this._documentEditorExtension = extension;
            this._documentEditorManager = documentEditorManager;
            objects.delegate = this._delegate;
            objects.view = this;
            return objects;
        } else { // DocumentEditor used as a SectionExtension
            this._delegate = DocumentEditorControlDelegate.initWithExtension(extension);
            let view = documentEditorManager.createDocumentEditorView(
                extension.androidContext(), JSON.stringify(params), this._delegate, null);
            objects.delegate = this._delegate;
            objects.view = view;
            return objects;
        }
    }
};
