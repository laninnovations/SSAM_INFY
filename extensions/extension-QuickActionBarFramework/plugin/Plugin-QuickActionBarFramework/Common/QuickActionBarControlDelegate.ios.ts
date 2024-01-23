interface QuickActionBarDelegate extends NSObjectProtocol { // tslint:disable-line
    onCreate?(): void;
    onChipSelected?(actionInfo: string): void;
    localizedValueParams?(key: string, params: string): string;
}

declare var QuickActionBarDelegate: {
    prototype: QuickActionBarDelegate;
};

@NativeClass()
class QuickActionBarControlDelegate extends NSObject implements QuickActionBarDelegate  {

    public static ObjCProtocols = [QuickActionBarDelegate]; // tslint:disable-line

    public static initWithExtension(controlExtension): QuickActionBarControlDelegate {
        let controlDelegate = <QuickActionBarControlDelegate> QuickActionBarControlDelegate.new();
        controlDelegate._controlExtension = controlExtension;
        return controlDelegate;
    }

    private _dataService: any;
    private _bridge: any;
    private _controlExtension: any;

    public setControlExtension(controlExtension) {
        this._controlExtension = controlExtension;
    }

    public onCreate() {
        this._controlExtension.onCreate();
    }

    public onChipSelected(actionInfo: any) {
        this._controlExtension.onChipSelected(actionInfo);
    }

    public localizedValueParams(key: string, params: string): string {
        return this._controlExtension.getExtensionLocalizedValue(key, params);
    }
}

export { QuickActionBarControlDelegate }
