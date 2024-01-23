export class DocumentEditorControlDelegate {

    public static initWithExtension(controlExtension): DocumentEditorControlDelegate {
        let controlDelegate = new DocumentEditorControlDelegate();
        controlDelegate._controlExtension = controlExtension;
        return controlDelegate;
    }

    private _controlExtension: any;

    public onCreate() {
        // intentional no-op
    }

    public onSave() {
        // intentional no-op
    }

    public onDelete() {
        // intentional no-op
    }

    public getLocalizedValue(key, params): any {
        // intentional no-op
    }
}
