export class QuickActionBarControlDelegate {

    public static initWithExtension(controlExtension): QuickActionBarControlDelegate {
        return new QuickActionBarControlDelegate();
    }

    public onCreate() {
        // Intentionally empty. No operation performed here.
    }

    public onChipSelected(actionInfo) {
        // Intentionally empty. No operation performed here.
    }

    public getLocalizedValue(key, params): any {
        // Intentionally empty. No operation performed here.
    }
}
