interface DocumentEditorDelegate extends NSObjectProtocol { // tslint:disable-line
    onCreate?(): void;
    onSave?(): void;
    onDelete?(): void;
    localizedValueParams?(key: string, params: string): string;
}

declare var DocumentEditorDelegate: {
    prototype: DocumentEditorDelegate;
};

@NativeClass()
class DocumentEditorControlDelegate extends NSObject implements DocumentEditorDelegate {

    public static ObjCProtocols = [DocumentEditorDelegate]; // tslint:disable-line

    public static initWithExtension(controlExtension): DocumentEditorControlDelegate {
        let controlDelegate = <DocumentEditorControlDelegate> DocumentEditorControlDelegate.new();
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

    // DocumentEditorDelegate

    public onCreate(): void {
        this._controlExtension.onCreate();
    }

    public onSave(): void {
        this._controlExtension.onSave();
    }

    public onDelete(): void {
        this._controlExtension.onDelete();
    }

    public localizedValueParams(key: string, params: string): string {
        return this._controlExtension.getExtensionLocalizedValue(key, params);
    }
}

export { DocumentEditorControlDelegate }
