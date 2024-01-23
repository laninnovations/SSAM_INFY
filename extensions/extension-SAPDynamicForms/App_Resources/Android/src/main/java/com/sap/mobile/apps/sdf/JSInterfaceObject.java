package com.sap.mobile.apps.sdf;

import android.webkit.JavascriptInterface;

public abstract class JSInterfaceObject {
    public JSInterfaceObject() {}
    
    @JavascriptInterface
    public void postMessage(String message) {
        this._postMessage(message);
    }

    public abstract void _postMessage(String message);
}