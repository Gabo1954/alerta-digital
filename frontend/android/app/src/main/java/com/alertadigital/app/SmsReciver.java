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

            // CONSULTA DE CONSENTIMIENTO (LEY 21.719)
            SharedPreferences prefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
            boolean consentimiento = "true".equals(prefs.getString("consentimiento_sms", "false"));

            if (!consentimiento) {
                Log.d(TAG, "Privacidad protegida: SMS ignorado por oposición del usuario.");
                return;
            }

            Bundle bundle = intent.getExtras();
            if (bundle != null) {
                Object[] pdus = (Object[]) bundle.get("pdus");
                if (pdus != null) {
                    for (Object pdu : pdus) {
                        SmsMessage sms = SmsMessage.createFromPdu((byte[]) pdu, bundle.getString("format"));
                        String contenido = sms.getMessageBody();

                        // Despertar OverlayService
                        Intent serviceIntent = new Intent(context, OverlayService.class);
                        serviceIntent.putExtra("sms_text", contenido);

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