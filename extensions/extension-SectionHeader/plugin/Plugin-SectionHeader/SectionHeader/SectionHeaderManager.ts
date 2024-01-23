import { SectionHeaderNativeObjects } from "./SectionHeaderNativeObjects";

export class SectionHeaderManager {
    public create(params: any, extension: any): SectionHeaderNativeObjects {
        return new SectionHeaderNativeObjects()
    }
}