declare var com;

@NativeClass()
@Interfaces([com.sap.sam.android.plugin.documenteditor.IDocumentEditorDelegate])
class DocumentEditorControlDelegate extends java.lang.Object {

    public static initWithExtension(controlExtension): DocumentEditorControlDelegate {
        let controlDelegate = new DocumentEditorControlDelegate();
        controlDelegate._controlExtension = controlExtension;
        return controlDelegate;
    }

    private _controlExtension: any;

    /**
     * Explicitly set reference to control extension
     * @param controlExtension
     */
    public setControlExtension(controlExtension) {
        this._controlExtension = controlExtension;
    }

    public onCreate() {
        this._controlExtension.onCreate();
    }

    public onSave() {
        this._controlExtension.onSave();
    }

    public onDelete() {
        this._controlExtension.onDelete();
    }

    public getLocalizedValue(key, params): any {
        return this._controlExtension.getExtensionLocalizedValue(key, params);
    }
}

export { DocumentEditorControlDelegate }
