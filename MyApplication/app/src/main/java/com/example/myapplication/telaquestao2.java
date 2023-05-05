package com.example.myapplication;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;

public class telaquestao2 extends AppCompatActivity {

    private ImageView feliz, triste;
    private TextView txtMensagemTeste2;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_telaquestao2);


        getSupportActionBar().hide();
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
        );


        feliz = findViewById(R.id.felizbtn);
        triste = findViewById(R.id.tristebtn);
        txtMensagemTeste2 = findViewById(R.id.txtMensagemTeste2);

        if(MainActivity.lingua==1){
            txtMensagemTeste2.setText("Como se sente?");
        } else {
            txtMensagemTeste2.setText("¿Como se siente?");
        }

        feliz.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent i = new Intent(telaquestao2.this, MainActivity.class);
                startActivity(i);
            }
        });
        triste.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent i = new Intent(telaquestao2.this, tela4_activity.class);
                startActivity(i);
            }
        });
    }

    public void onBackPressed() {
        // não chame o super desse método
    }

}