import { BaseExtension } from 'extension-Common/BaseExtension';
import { QuickActionBarParser } from './QuickActionBarParser';
import { QuickActionBarBridge } from 'extension-QuickActionBarFramework';
import { Utils } from 'extension-Common/Utils';

export class QuickActionBarExtension extends BaseExtension {

    protected _delegate: any;
    protected _chips: any;

    public initialize(props) {
        this._parser = new QuickActionBarParser();
        super.initialize(props);

        let qabBridge: QuickActionBarBridge = new QuickActionBarBridge();
        let nativeObjects = qabBridge.create(this.getParams(), this);
        this._delegate = nativeObjects.delegate;
        this._bridge = nativeObjects.bridge;
        this.setViewController(nativeObjects.view);
    }

    public onCreate() {
        let extProps = this.definition().data.ExtensionProperties;
        if (extProps) {
            let chips = extProps.Chips;
            if (chips) {
                this._chips = [];

                let aChipsPromises : Promise<any>[] = [];
                for (let index = 0; index < chips.length; index++) {
                    let chip = Object.assign({}, chips[index]);
            
                    let aPropertiesPromises : Promise<any>[] = [];
                    aPropertiesPromises.push(Promise.resolve(this._parser.parse(chip.IsIconVisible ? chip.IsIconVisible : false, this.context, 'IsIconVisible')));
                    aPropertiesPromises.push(Promise.resolve(this._parser.parse(chip.IsButtonVisible ? chip.IsButtonVisible : false, this.context, 'IsButtonVisible')));
                    aPropertiesPromises.push(Promise.resolve(this._parser.parse(chip.IsButtonEnabled ? chip.IsButtonEnabled : false, this.context, 'IsButtonEnabled')));
                    aPropertiesPromises.push(this.valueResolver().resolveValue(chip.Label ? chip.Label : '', this.context));

                    if (chip.Icon) {
                        let iconData = chip.Icon;
                        if (!iconData.includes('data:image/')) {
                            aPropertiesPromises.push(this.valueResolver().resolveValue(iconData, this.context));
                        }
                    }

                    aChipsPromises.push(
                        Promise.all(aPropertiesPromises).then(resolvedProperties => {
                            chip.IsIconVisible = typeof resolvedProperties[0].value === 'boolean' ? resolvedProperties[0].value : false;
                            chip.IsButtonVisible = typeof resolvedProperties[1].value === 'boolean' ? resolvedProperties[1].value : false;
                            chip.IsButtonEnabled = typeof resolvedProperties[2].value === 'boolean' ? resolvedProperties[2].value : false;
                            chip.Label = resolvedProperties[3];

                            if (resolvedProperties[4]) {
                                chip.Icon = resolvedProperties[4];
                            }

                            return chip;
                        })
                    );
                }

                Promise.all(aChipsPromises).then(chips => {
                    if (Utils.isAndroid()) {
                        this._bridge.updateAllChips(JSON.stringify({Chips:chips}));
                    } else {
                        this._bridge.updateAllChips({Chips:chips});
                    }
                });
            }
        }
    }

    public getAllChips() {
        return this._chips;
    }

    public localizedValue(key: string, params: string): any {
        return "";
    }

    public onChipSelected(actionInfo: any) {
        if (actionInfo && actionInfo.length > 0) {
            let action = Utils.isAndroid() ? JSON.parse(actionInfo) : actionInfo;
            return this.runActionWithBinding(action);
        }
    }
}
