package com.example.myapplication;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

public class tela11_activity extends AppCompatActivity {
    private TextView txtMensagemT11;
    private Button passartela11;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_tela11);

        getSupportActionBar().hide();
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
        );


        passartela11 = findViewById(R.id.passartela12btn);
        txtMensagemT11 = findViewById(R.id.txtMensagemT11);

        if(MainActivity.lingua==1){
            passartela11.setText("próximo");
            txtMensagemT11.setText("Respire devagar e perceba que agora esta em segurança. Seu sistema nervoso está agitado mas logo ele irá se acalmar e a crise irá embora");
        } else {
            passartela11.setText("Vamos a seguir");
            txtMensagemT11.setText("Respira lentamente y date cuenta de que ahora estás a salvo. Tu sistema nervioso está agitado pero pronto se calmará y la crisis se irá");
        }

        passartela11.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent i = new Intent(tela11_activity.this, tela12_activity.class);
                startActivity(i);
            }
        });
    }

    public void onBackPressed() {
        // não chame o super desse método
    }

}