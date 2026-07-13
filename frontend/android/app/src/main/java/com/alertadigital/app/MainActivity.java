package com.alertadigital.app;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.webkit.WebView;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Registrar el plugin para la burbuja
        registerPlugin(OverlayPermissionPlugin.class);

        super.onCreate(savedInstanceState);
        WebView.setWebContentsDebuggingEnabled(true);

        solicitarPermisosVitales();
    }

    private void solicitarPermisosVitales() {
        String[] permisos;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permisos = new String[]{
                    Manifest.permission.RECEIVE_SMS,
                    Manifest.permission.READ_SMS,
                    Manifest.permission.POST_NOTIFICATIONS
            };
        } else {
            permisos = new String[]{
                    Manifest.permission.RECEIVE_SMS,
                    Manifest.permission.READ_SMS
            };
        }

        boolean necesitaPedir = false;
        for (String permiso : permisos) {
            if (ContextCompat.checkSelfPermission(this, permiso) != PackageManager.PERMISSION_GRANTED) {
                necesitaPedir = true;
                break;
            }
        }

        if (necesitaPedir) {
            ActivityCompat.requestPermissions(this, permisos, 100);
        }
    }
}