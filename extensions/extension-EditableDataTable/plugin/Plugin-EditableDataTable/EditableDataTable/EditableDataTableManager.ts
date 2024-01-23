import { EditableDataTableNativeObjects } from "./EditableDataTableNativeObjects";

export class EditableDataTableManager {
    public create(params: any, extension: any): EditableDataTableNativeObjects {
        return new EditableDataTableNativeObjects()
    }
}