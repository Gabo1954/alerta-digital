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

            // Leer las preferencias guardadas desde React
            SharedPreferences prefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
            boolean consentimientoSms = "true".equals(prefs.getString("consentimiento_sms", "true"));
            boolean burbujaActiva = "true".equals(prefs.getString("burbuja_activa", "false"));

            // Si apagó alguno de los dos interruptores, nos detenemos para ahorrar batería
            if (!consentimientoSms || !burbujaActiva) {
                Log.d(TAG, "Protección en pausa: El usuario desactivó la IA en el Perfil.");
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

                        Log.d(TAG, "SMS Interceptado para análisis IA. Remitente: " + remitente);

                        // Arranca el servicio en segundo plano que dibujará la burbuja
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