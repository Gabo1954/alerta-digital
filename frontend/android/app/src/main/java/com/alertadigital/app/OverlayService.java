package com.alertadigital.app;

import android.app.Service;
import android.content.Intent;
import android.os.IBinder;
import android.util.Log;

public class OverlayService extends Service {

    @Override
    public void onCreate() {
        super.onCreate();
        Log.d("OverlayService", "Servicio iniciado");
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        String textoSms = intent.getStringExtra("sms_text");
        Log.d("OverlayService", "Analizando SMS: " + textoSms);

        // Aquí iría tu lógica de la ventana flotante

        return START_NOT_STICKY;
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}