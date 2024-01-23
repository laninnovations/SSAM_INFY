import { Observable } from "@nativescript/core";

export class WebViewModel extends Observable {
  private _context: any;
  private _src: string;

  private _enablePadding: boolean;
  private _enableToolbar: boolean;

  constructor(context: any, src: string) {
    super();
    this._context = context;
    this._src = src;

    this._enablePadding = false;
    this._enableToolbar = false;
  }

  public get context() {
    return this._context;
  }

  public get src(): string {
    return this._src;
  }

  public get enablePadding(): boolean {
    return this._enablePadding;
  }
  public set enablePadding(value: boolean) {
    this._enablePadding = value;
  }

  public get enableToolbar(): boolean {
    return this._enableToolbar;
  }
  public set enableToolbar(value: boolean) {
    this._enableToolbar = value;
  }
}
