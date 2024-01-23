declare var com;

@NativeClass()
@Interfaces([com.sap.sam.android.plugin.quickactionbar.IQuickActionBarDelegate])
class QuickActionBarControlDelegate extends java.lang.Object {

    private _controlExtension: any;

    public static initWithExtension(controlExtension): QuickActionBarControlDelegate {
        let controlDelegate = new QuickActionBarControlDelegate();
        controlDelegate._controlExtension = controlExtension;
        return controlDelegate;
    }

    public onCreate() {
        this._controlExtension.onCreate();
    }

    public onChipSelected(actionInfo: any) {
        this._controlExtension.onChipSelected(actionInfo);
    }

    public getLocalizedValue(key, params): any {
        return this._controlExtension.localizedValue(key, params);
    }
}

export { QuickActionBarControlDelegate}