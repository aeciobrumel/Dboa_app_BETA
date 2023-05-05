package com.example.myapplication;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

public class tela14_activity extends AppCompatActivity {
    private TextView txtMensagemT14;
    private Button passartela14;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_tela14);

        getSupportActionBar().hide();
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
        );


        passartela14 = findViewById(R.id.passartela15btn);
        txtMensagemT14 = findViewById(R.id.txtMensagemT14);

        if(MainActivity.lingua==1){
            passartela14.setText("próximo");
            txtMensagemT14.setText("Não há perigo mesmo, as pessoas não ficam loucas porque se sentem tontas ou porque o coração esteja batendo rapidamente. Isso é ativação fisiológica. A mesma que ocorre quando você está se exercitando");
        } else {
            passartela14.setText("Vamos a seguir");
            txtMensagemT14.setText("No hay ningún peligro en absoluto, la gente no se vuelve loca porque se siente mareada o porque su corazón late rápido. Esta es la activación fisiológica. Igual que cuando haces ejercicio.");
        }

        passartela14.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent i = new Intent(tela14_activity.this, tela15_activity.class);
                startActivity(i);
            }
        });
    }

    public void onBackPressed() {
        // não chame o super desse método
    }

}