declare var com;

@NativeClass()
@Interfaces([com.sap.sam.android.plugin.section_header.ISectionHeaderDelegate])
class SectionHeaderControlDelegate extends java.lang.Object {

    private _controlExtension: any;

    public static initWithExtension(controlExtension): SectionHeaderControlDelegate {
        let controlDelegate = new SectionHeaderControlDelegate();
        controlDelegate._controlExtension = controlExtension;
        return controlDelegate;
    }

    public setControlExtension(controlExtension) {
        this._controlExtension = controlExtension;
    }

    public onCreate() {
        this._controlExtension.onCreate();
    }

    public onPress(action) {
        this._controlExtension.onPress(action);
    }

    public localizedValue(key, params): any {
        return this._controlExtension.localizedValue(key, params);
    }
}

export { SectionHeaderControlDelegate }
