import { IControl } from "mdk-core/controls/IControl";
import { IControlData } from "mdk-core/controls/IControlData";
import { BaseObservable } from "mdk-core/observables/BaseObservable";
import { getLogger } from "./NativeScriptWebView/log/logger";

export abstract class AbstractWebView extends IControl {
  private _observable: BaseObservable;
  private _logger: any;
  private _logDomain: string;

  public initialize(props: IControlData): void {
    super.initialize(props);

    this._logger = getLogger(this);
    this._logDomain = this.constructor.name;

    this.logger.debug("Initializing the extension ...", this.logDomain);
  }

  public viewIsNative() {
    return true;
  }

  public observable() {
    if (!this._observable) {
      this._observable = new BaseObservable(
        this,
        this.definition(),
        this.page()
      );
    }
    return this._observable;
  }

  public setContainer(container: IControl) {
    // do nothing
  }

  public setValue(value: any, notify: boolean): Promise<any> {
    // do nothing
    return Promise.resolve();
  }

  public get logger() {
    return this._logger;
  }

  public get logDomain() {
    return this._logDomain;
  }

  protected async resolveExtensionProperties(): Promise<any> {
    const extProps = this.definition().data.ExtensionProperties;
    if (!extProps) {
      this.logger.debug("ExtensionProperties is undefined", this.logDomain);
      return Promise.resolve({});
    } else {
      const promises = [];
      const propsNames = Object.keys(extProps);
      propsNames.forEach((propName) => {
        promises.push(this.valueResolver().resolveValue(extProps[propName]));
      });
      return Promise.all(promises).then((results) => {
        const resolvedProperties = {};
        for (let i = 0; i < results.length; i++) {
          resolvedProperties[propsNames[i]] = results[i];
        }
        return resolvedProperties;
      });
    }
  }
}
