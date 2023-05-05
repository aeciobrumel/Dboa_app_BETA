package com.example.myapplication;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

public class tela3_activity extends AppCompatActivity {

    private TextView txtMensagemT3;
    private Button passartela3;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_tela3);

        getSupportActionBar().hide();
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
        );

        txtMensagemT3 = findViewById(R.id.txtMensagemT3);
        passartela3 = findViewById(R.id.passartela4btn);

        if(MainActivity.lingua==1){
            passartela3.setText("Vamos continuar");
            txtMensagemT3.setText("Concentre na música e siga as instruções...");
        } else {
            passartela3.setText("Vamos a seguir");
            txtMensagemT3.setText("Concéntrate en la música y sigue las instrucciones...");
        }



        passartela3.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent i = new Intent(tela3_activity.this, tela4_activity.class);
                startActivity(i);
            }
        });
    }

    @Override
    public void onBackPressed() {
        // não chame o super desse método
    }

}