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
        super.onCreate(savedInstanceState);

        // Habilitar depuración de la vista web para chrome://inspect (Solo para desarrollo/QA)
        WebView.setWebContentsDebuggingEnabled(true);

        // Registramos el plugin personalizado para solicitar el permiso de la Burbuja Flotante
        registerPlugin(OverlayPermissionPlugin.class);

        // NUEVO: Solicitar permisos en pantalla obligatoriamente al abrir la app
        solicitarPermisosVitales();
    }

    private void solicitarPermisosVitales() {
        String[] permisos;
        // Android 13+ exige permiso extra para las notificaciones
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

        // Si falta algún permiso, mostramos el pop-up nativo del sistema
        if (necesitaPedir) {
            ActivityCompat.requestPermissions(this, permisos, 100);
        }
    }
}