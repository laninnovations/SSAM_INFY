interface SectionHeaderDelegate extends NSObjectProtocol { // tslint:disable-line
    onCreate?(): void;
    onPress?(action: string): void;
    localizedValueParams?(key: string, params: string): string;
}


declare var SectionHeaderDelegate: {
    prototype: SectionHeaderDelegate;
};

@NativeClass()
class SectionHeaderControlDelegate extends NSObject implements SectionHeaderDelegate  {

    public static ObjCProtocols = [SectionHeaderDelegate]; // tslint:disable-line
    
    public static initWithExtension(controlExtension): SectionHeaderControlDelegate {
        let controlDelegate = <SectionHeaderControlDelegate> SectionHeaderControlDelegate.new();
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

    public onPress(action: string): void {
        this._controlExtension.onPress(action);
    }

    public localizedValueParams(key: string, params: string): string {
        return this._controlExtension.localizedValue(key, params);
    }
}

export { SectionHeaderControlDelegate }