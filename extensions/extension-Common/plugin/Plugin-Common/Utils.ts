import { Device } from '@nativescript/core';

export class Utils {

    public static isAndroid() {
        return Device.os === 'Android';
    }

    public static clone(object): any {
        return JSON.parse(JSON.stringify(object));
    }

    public static  createMockAnalyticsData(): any {
        let objects = [
            {
                ReadingDate: '2017-04-10T00:00:00',
                ReadingValue: '10',
            },
            {
                ReadingDate: '2017-04-11T00:00:00',
                ReadingValue: '12',
            },
            {
                ReadingDate: '2017-04-12T00:00:00',
                ReadingValue: '15',
            },
            {
                ReadingDate: '2017-04-13T00:00:00',
                ReadingValue: '11',
            },
            {
                ReadingDate: '2017-04-14T00:00:00',
                ReadingValue: '14',
            },
            {
                ReadingDate: '2017-04-15T00:00:00',
                ReadingValue: '18',
            },
        ];
        return objects;
    }

    /**
     * SAP Measuring Point records return numbers in a strange string format with thousand separators.
     *  This removes those
     */
    public static convertSapStringToNumber(value) {
        try {
            return parseFloat(value.replace(/,/g, ''));
        } catch (err) {
            console.log(err.message);
            return value;
        }
    }

    /**
     * Return the number of milliseconds since January 1, 1970:
     */
    public static getTime(unformatedDate) {
        let result = new Date(unformatedDate);
        return result.getTime();
    }

    /**
     * Return the number of milliseconds since January 1, 1970:
     */
    public static formatDate(unformatedDate) {
        let result = new Date(unformatedDate);
        return result.toLocaleDateString();
    }
    /**
     * coverts to String
     */
    public static toString(value: any): string {
        if (Utils._convertType(value)) {
        return value.toString();
    }
        return value;
    }

    /**
     * filter query options
     */
    public static filterQueryOptions(queryOptions: string, option: string): string {
        if (queryOptions.length > 0) {
            const splitOptions = queryOptions.split('&');
            let filteredOption = '';
            if (!splitOptions[0].toLowerCase().startsWith(option)) {
                filteredOption = splitOptions[0];
            }
            for (let i = 1; i < splitOptions.length; i++) {
                if (!splitOptions[i].toLowerCase().startsWith(option)) {
                    filteredOption += '&' + splitOptions[i];
                }
            }
            return filteredOption;
        }
        return '';
    }

    private static _convertType(value: any): boolean {
    return value && typeof value !== 'string' && typeof value !== 'object' && value.toString;
    }
}
