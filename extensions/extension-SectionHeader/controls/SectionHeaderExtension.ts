import { BaseExtension } from 'extension-Common/BaseExtension';
import { Utils } from 'extension-Common/Utils';
import { ValueResolver} from 'mdk-core/utils/ValueResolver';
import { SectionHeaderParser } from './SectionHeaderParser';
import { SectionHeaderBridge } from 'extension-SectionHeader';
import { NonResolvableObjects } from 'extension-Common/NonResolvableObjects';

export class SectionHeaderExtension extends BaseExtension {
    protected _delegate: any;

    public initialize(props) {
        this._parser = new SectionHeaderParser();
        super.initialize(props); 

        let bridge: SectionHeaderBridge = new SectionHeaderBridge();
        let nativeObjects = bridge.create(this.getParams(), this);
        this._delegate = nativeObjects.delegate;
        this._bridge = nativeObjects.bridge;

        this.setViewController(nativeObjects.view);
    }

    public onCreate() {
        const params = Utils.clone(this.getParams());
        const buttonActions = new NonResolvableObjects('Action');
        const linkActions = new NonResolvableObjects('Action');

        if (params.Buttons) {
            for (let i = 0; i < params.Buttons.length; i++) {
                buttonActions.cache(params.Buttons[i], i);
            }
        }
        if (params.Link) {
            linkActions.cache(params.Link, 0);
        }
        ValueResolver.resolveKeyValues(params, this.context).then((result) => {
            const object = <any>result;
            if (object.Buttons) {
                for (let i = 0; i < object.Buttons.length; i++) {
                    buttonActions.restore(object.Buttons[i], i);
                }
            }
            if (object.Link) {
                linkActions.restore(object.Link, 0);
            }
            if (this._bridge) {
                this._bridge.setSectionHeader(Utils.isAndroid() ? JSON.stringify(object) : object);
            }
        });
    }

    public onPress(action) {
        if (action) {
            this.executeActionOrRule(action, this.context);
        }
    }

    public localizedValue(key: string, params: string): any {
        return "";
    }

    public setStatusText(statusText: string) {
        if (this._bridge) {
            this._bridge.setStatusText(statusText);
        }
    }

    public setLink(link: any) {
        if (this._bridge) {
            this._bridge.setLink(Utils.isAndroid() ? JSON.stringify(link) : link);
        }
    }
}
