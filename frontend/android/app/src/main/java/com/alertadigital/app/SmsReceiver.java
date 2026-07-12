package com.alertadigital.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.Bundle;
import android.telephony.SmsMessage;
import android.util.Log;

public class SmsReceiver extends BroadcastReceiver {

    private static final String TAG = "AlertaDigital_Vigia";

    @Override
    public void onReceive(Context context, Intent intent) {
        if ("android.provider.Telephony.SMS_RECEIVED".equals(intent.getAction())) {

            Log.d(TAG, "¡SMS RECIBIDO A NIVEL DE SISTEMA!");

            SharedPreferences prefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
            boolean consentimiento = "true".equals(prefs.getString("consentimiento_sms", "true")); // Por defecto true

            if (!consentimiento) {
                Log.d(TAG, "Privacidad protegida: SMS ignorado por falta de consentimiento.");
                return;
            }

            Bundle bundle = intent.getExtras();
            if (bundle != null) {
                Object[] pdus = (Object[]) bundle.get("pdus");
                if (pdus != null) {
                    for (Object pdu : pdus) {
                        String format = bundle.getString("format");
                        SmsMessage sms = SmsMessage.createFromPdu((byte[]) pdu, format);

                        String remitente = sms.getDisplayOriginatingAddress();
                        String contenido = sms.getMessageBody();

                        Log.d(TAG, "Intercepción detectada. Remitente: " + remitente);

                        // Iniciar el servicio que hará la petición a Render
                        Intent serviceIntent = new Intent(context, OverlayService.class);
                        serviceIntent.putExtra("sms_text", contenido);
                        serviceIntent.putExtra("sms_sender", remitente);

                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                            context.startForegroundService(serviceIntent);
                        } else {
                            context.startService(serviceIntent);
                        }
                    }
                }
            }
        }
    }
}