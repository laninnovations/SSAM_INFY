import { QuickActionBarExtension } from './QuickActionBarExtension';
import { Utils } from 'extension-Common/Utils';

export class QuickActionBarViewExtension extends QuickActionBarExtension {
    public view() {
        if (Utils.isAndroid()) {
            return super.view();
        } else {
            return super.view().view;
        }
    }
}
