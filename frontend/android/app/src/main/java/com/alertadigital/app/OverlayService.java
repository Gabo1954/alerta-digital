package com.alertadigital.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.PixelFormat;
import android.graphics.drawable.GradientDrawable;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.view.Gravity;
import android.view.View;
import android.view.WindowManager;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.util.Log;

import org.json.JSONObject;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Scanner;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class OverlayService extends Service {

    private WindowManager windowManager;
    private View floatingView;

    @Override
    public void onCreate() {
        super.onCreate();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel("alerta_chan", "Alerta Scanner", NotificationManager.IMPORTANCE_LOW);
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) manager.createNotificationChannel(channel);

            Notification notification = new Notification.Builder(this, "alerta_chan")
                    .setContentTitle("Escudo Alerta Digital")
                    .setContentText("Analizando SMS con IA...")
                    .setSmallIcon(android.R.drawable.ic_dialog_info)
                    .build();
            startForeground(1, notification);
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null) {
            String smsText = intent.getStringExtra("sms_text");
            String smsSender = intent.getStringExtra("sms_sender");
            analizarSmsEnRender(smsText, smsSender);
        }
        return START_NOT_STICKY;
    }

    private void analizarSmsEnRender(String texto, String sender) {
        ExecutorService executor = Executors.newSingleThreadExecutor();
        executor.execute(() -> {
            try {
                URL url = new URL("https://alerta-digital.onrender.com/api/mensajes/analizar");
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setDoOutput(true);

                JSONObject jsonParam = new JSONObject();
                jsonParam.put("contenido", texto);

                OutputStream os = conn.getOutputStream();
                os.write(jsonParam.toString().getBytes("UTF-8"));
                os.close();

                int responseCode = conn.getResponseCode();

                if (responseCode >= 200 && responseCode < 300) {
                    Scanner scanner = new Scanner(conn.getInputStream());
                    String response = scanner.useDelimiter("\\A").hasNext() ? scanner.next() : "";
                    scanner.close();

                    JSONObject jsonResponse = new JSONObject(response);
                    JSONObject reporte = jsonResponse.getJSONObject("reporte");
                    String riesgo = reporte.getString("nivel_riesgo");

                    new Handler(Looper.getMainLooper()).post(() -> mostrarBurbuja(riesgo, sender));
                } else {
                    lanzarAnalisisDeRespaldo(texto, sender);
                }
            } catch (Exception e) {
                Log.e("AlertaDigital", "Error en API Render: " + e.getMessage());
                lanzarAnalisisDeRespaldo(texto, sender);
            }
        });
    }

    // Análisis Heurístico Local por si Render falla o no hay Internet
    private void lanzarAnalisisDeRespaldo(String texto, String sender) {
        String t = texto.toLowerCase();
        boolean esPeligroso = t.contains("http") || t.contains("www") || t.contains("banco") || t.contains("clave") || t.contains("urgente") || t.contains("bloqueada") || t.contains("premio");
        String riesgo = esPeligroso ? "Alto" : "Bajo";
        new Handler(Looper.getMainLooper()).post(() -> mostrarBurbuja(riesgo, sender));
    }

    private void mostrarBurbuja(String riesgo, String sender) {
        windowManager = (WindowManager) getSystemService(WINDOW_SERVICE);

        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setPadding(50, 40, 50, 40);

        boolean esPeligroso = riesgo.equals("Alto") || riesgo.equals("Medio");

        GradientDrawable shape = new GradientDrawable();
        shape.setShape(GradientDrawable.RECTANGLE);
        shape.setCornerRadius(50f);
        // Colores semánticos reales de riesgo
        shape.setColor(esPeligroso ? Color.parseColor("#EF4444") : Color.parseColor("#10B981"));
        shape.setStroke(8, Color.parseColor("#FFFFFF"));
        layout.setBackground(shape);

        TextView title = new TextView(this);
        title.setText(esPeligroso ? "⚠️ ALERTA DE RIESGO: " + sender : "✅ SMS SEGURO: " + sender);
        title.setTextColor(Color.WHITE);
        title.setTextSize(14);
        title.setTypeface(null, android.graphics.Typeface.BOLD);
        layout.addView(title);

        TextView desc = new TextView(this);
        desc.setText(esPeligroso ? "Posible Phishing o Fraude. No abras el enlace." : "No se detectaron amenazas en el mensaje.");
        desc.setTextColor(Color.WHITE);
        desc.setTextSize(16);
        desc.setPadding(0, 15, 0, 0);
        desc.setTypeface(null, android.graphics.Typeface.BOLD);
        layout.addView(desc);

        WindowManager.LayoutParams params = new WindowManager.LayoutParams(
                WindowManager.LayoutParams.MATCH_PARENT,
                WindowManager.LayoutParams.WRAP_CONTENT,
                Build.VERSION.SDK_INT >= Build.VERSION_CODES.O ?
                        WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY : WindowManager.LayoutParams.TYPE_PHONE,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
                PixelFormat.TRANSLUCENT
        );
        params.gravity = Gravity.TOP;
        params.y = 100;

        floatingView = layout;
        windowManager.addView(floatingView, params);

        layout.setOnClickListener(v -> destruirBurbuja());

        // Destrucción automática después de 7 segundos
        new Handler(Looper.getMainLooper()).postDelayed(this::destruirBurbuja, 7000);
    }

    private void destruirBurbuja() {
        try {
            if (floatingView != null && windowManager != null) {
                windowManager.removeView(floatingView);
                floatingView = null;
            }
        } catch (Exception ignored) {}
        stopSelf();
    }

    @Override
    public IBinder onBind(Intent intent) { return null; }
}