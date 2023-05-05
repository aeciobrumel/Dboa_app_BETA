package com.example.myapplication;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

public class tela16_activity extends AppCompatActivity {

    private TextView txtMensagemT16;
    private Button passartela16;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_tela16);

        getSupportActionBar().hide();
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
        );


        passartela16 = findViewById(R.id.passartela17btn);
        txtMensagemT16 = findViewById(R.id.txtMensagemT16);

        if(MainActivity.lingua==1){
            passartela16.setText("próximo");
            txtMensagemT16.setText("O aumento dos batimentos cardiacos e a respiração rápida podem simplesmente ser sinais de que você está se sentindo ansioso. Quantas vezes interpretou mal essas sensações? Por que elas deveriam ser perigosas agora? As pessoas não ficam loucas por estarem ansiosas");
        } else {
            passartela16.setText("Vamos a seguir");
            txtMensagemT16.setText("Un ritmo cardíaco acelerado y una respiración rápida podrían ser simplemente signos de que te sientes ansioso. ¿Cuántas veces has malinterpretado estas sensaciones? ¿Por qué deberían ser peligrosos ahora? La gente no se vuelve loca por estar ansiosa");
        }


        passartela16.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent i = new Intent(tela16_activity.this, tela17_activity.class);
                startActivity(i);
            }
        });
    }

    public void onBackPressed() {
        // não chame o super desse método
    }

}