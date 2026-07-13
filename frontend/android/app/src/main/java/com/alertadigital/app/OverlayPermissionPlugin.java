package com.alertadigital.app;

import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "OverlayPermission")
public class OverlayPermissionPlugin extends Plugin {

    @PluginMethod
    public void requestPermission(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (!Settings.canDrawOverlays(getContext())) {
                try {
                    // Intento 1: Mandarlo directo a tu app
                    Intent intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                            Uri.parse("package:" + getContext().getPackageName()));
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    getContext().startActivity(intent);
                } catch (Exception e) {
                    Log.e("OverlayPlugin", "Fallo al abrir con URI, intentando sin URI", e);
                    try {
                        // Intento 2 (Fallback): Mandarlo a la lista general de apps
                        Intent intent2 = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION);
                        intent2.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                        getContext().startActivity(intent2);
                    } catch (Exception ex) {
                        Log.e("OverlayPlugin", "Fallo total al abrir ajustes", ex);
                        call.reject("No se pudo abrir la configuración");
                        return;
                    }
                }
            }
        }
        call.resolve();
    }

    @PluginMethod
    public void checkPermission(PluginCall call) {
        boolean hasPermission = true;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            hasPermission = Settings.canDrawOverlays(getContext());
        }
        JSObject ret = new JSObject();
        ret.put("granted", hasPermission);
        call.resolve(ret);
    }
}