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
        // Android exige una notificación para mantener vivo el servicio en segundo plano
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel("alerta_chan", "Alerta Scanner", NotificationManager.IMPORTANCE_LOW);
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) manager.createNotificationChannel(channel);

            Notification notification = new Notification.Builder(this, "alerta_chan")
                    .setContentTitle("Alerta Digital")
                    .setContentText("Analizando SMS entrante con IA...")
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
            // Realizamos la petición HTTP a Render en un hilo secundario
            analizarSmsEnRender(smsText, smsSender);
        }
        return START_NOT_STICKY;
    }

    private void analizarSmsEnRender(String texto, String sender) {
        ExecutorService executor = Executors.newSingleThreadExecutor();
        executor.execute(() -> {
            try {
                // LLAMADA HTTP A TU BACKEND EN RENDER
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

                Scanner scanner = new Scanner(conn.getInputStream());
                String response = scanner.useDelimiter("\\A").hasNext() ? scanner.next() : "";
                scanner.close();

                JSONObject jsonResponse = new JSONObject(response);
                JSONObject reporte = jsonResponse.getJSONObject("reporte");
                String riesgo = reporte.getString("nivel_riesgo");

                // Volvemos al hilo principal para dibujar la burbuja en pantalla
                new Handler(Looper.getMainLooper()).post(() -> mostrarBurbuja(riesgo, sender));

            } catch (Exception e) {
                e.printStackTrace();
                new Handler(Looper.getMainLooper()).post(this::stopSelf);
            }
        });
    }

    private void mostrarBurbuja(String riesgo, String sender) {
        windowManager = (WindowManager) getSystemService(WINDOW_SERVICE);

        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setPadding(50, 40, 50, 40);

        // Color rojo si es peligroso, verde si es seguro
        boolean esPeligroso = riesgo.equals("Alto") || riesgo.equals("Medio");

        GradientDrawable shape = new GradientDrawable();
        shape.setShape(GradientDrawable.RECTANGLE);
        shape.setCornerRadius(50f);
        shape.setColor(esPeligroso ? Color.parseColor("#EF4444") : Color.parseColor("#22C55E"));
        shape.setStroke(4, Color.parseColor("#FFFFFF"));
        layout.setBackground(shape);

        TextView title = new TextView(this);
        title.setText("🛡️ Alerta Digital - " + sender);
        title.setTextColor(Color.WHITE);
        title.setTextSize(14);
        title.setTypeface(null, android.graphics.Typeface.BOLD);
        layout.addView(title);

        TextView desc = new TextView(this);
        desc.setText(esPeligroso ? "¡RIESGO DETECTADO! No abras enlaces." : "SMS Seguro. Nivel bajo.");
        desc.setTextColor(Color.WHITE);
        desc.setTextSize(16);
        desc.setPadding(0, 10, 0, 0);
        desc.setTypeface(null, android.graphics.Typeface.BOLD);
        layout.addView(desc);

        // Configuramos la ventana para dibujarse sobre otras aplicaciones
        WindowManager.LayoutParams params = new WindowManager.LayoutParams(
                WindowManager.LayoutParams.MATCH_PARENT,
                WindowManager.LayoutParams.WRAP_CONTENT,
                Build.VERSION.SDK_INT >= Build.VERSION_CODES.O ?
                        WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY : WindowManager.LayoutParams.TYPE_PHONE,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
                PixelFormat.TRANSLUCENT
        );
        params.gravity = Gravity.TOP;
        params.y = 100; // Margen superior

        floatingView = layout;
        windowManager.addView(floatingView, params);

        // Criterio de Aceptación: Se cierra al tocarla
        layout.setOnClickListener(v -> destruirBurbuja());

        // Criterio de Aceptación: Auto-destrucción en 6 segundos
        new Handler(Looper.getMainLooper()).postDelayed(this::destruirBurbuja, 6000);
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