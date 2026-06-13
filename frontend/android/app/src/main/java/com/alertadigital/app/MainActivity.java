package com.alertadigital.app;

import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(android.os.Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Habilitar depuración WebView para chrome://inspect
        WebView.setWebContentsDebuggingEnabled(true);
    }
}
