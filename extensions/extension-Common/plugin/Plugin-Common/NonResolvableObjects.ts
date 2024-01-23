import { Utils } from './Utils';

export class NonResolvableObjects {
    private _array;
    private _property;

    constructor(property) {
        this._array = [];
        this._property = property;
    }

    cache(object, index) {
        if (object && object[this._property]) {
            this._array[index] = Utils.clone(object[this._property]);
            delete object[this._property];
        }
    }

    restore(object, index) {
        if (object && this._array[index]) {
            object[this._property] = this._array[index];
        }
    }
}