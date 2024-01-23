import { EditableDataTableExtension } from './EditableDataTableExtension';
import { Utils } from 'extension-Common/Utils';

export class EditableDataTableViewExtension extends EditableDataTableExtension {
    public view() {
        if (Utils.isAndroid()) {
            return super.view();
        } else {
            return super.view().view;
        }
    }
}
