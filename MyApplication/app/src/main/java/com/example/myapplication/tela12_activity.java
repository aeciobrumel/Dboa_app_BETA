package com.example.myapplication;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

public class tela12_activity extends AppCompatActivity {
    private TextView txtMensagemT12;
    private Button passartela12;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_tela12);

        getSupportActionBar().hide();
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
        );


        passartela12 = findViewById(R.id.passartela13btn);
        txtMensagemT12 = findViewById(R.id.txtMensagemT12);

        if(MainActivity.lingua==1){
            passartela12.setText("próximo");
            txtMensagemT12.setText("Perceba que estes sintomas estão te preparando apenas para lutar ou fugir, mas você sabe que não há perigo nenhum! Seu cérebro está procurando um inimigo que não existe e isso só irá durar de 10 a 15 minutos");
        } else {
            passartela12.setText("Vamos a seguir");
            txtMensagemT12.setText("Date cuenta de que estos síntomas solo te están preparando para luchar o huir, ¡pero sabes que no hay peligro! Tu cerebro está buscando un enemigo que no existe y solo durará de 10 a 15 minutos.");
        }


        passartela12.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent i = new Intent(tela12_activity.this, tela13_activity.class);
                startActivity(i);
            }
        });
    }

    public void onBackPressed() {
        // não chame o super desse método
    }

}