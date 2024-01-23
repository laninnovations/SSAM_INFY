export class EditableDataTableControlDelegate {

    public static initWithExtension(controlExtension): EditableDataTableControlDelegate {
        return new EditableDataTableControlDelegate();
    }

    public onCreate() {
        // intentional no-op
    }

    public paginateListPicker(target, pagingParams) {
        // intentional no-op
    }

    public searchListPicker(target, searchParams) {
        // intentional no-op
    }

    public onValueChange(row, column, cell) {
        // intentional no-op
    }

    public onPress(row, column, action) {
        // intentional no-op
    }

    public onError(message, isDelay) {
        // intentional no-op
    }

    public onCellFocusChange(hasFocus) {
        // intentional no-op
    }

    public localizedValue(key, params): any {
        // intentional no-op
    }
}
