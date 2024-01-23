import { SectionHeaderExtension } from './SectionHeaderExtension';
import { Utils } from 'extension-Common/Utils';

export class SectionHeaderViewExtension extends SectionHeaderExtension {
    public view() {
        if (Utils.isAndroid()) {
            return super.view();
        } else {
            return super.view().view;
        }
    }
}
