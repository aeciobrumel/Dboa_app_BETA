package com.example.myapplication;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

public class tela17_activity extends AppCompatActivity {
    private TextView txtMensagemT17;
    private Button passartela17;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_tela17);

        getSupportActionBar().hide();
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
        );


        passartela17 = findViewById(R.id.voltarmenubtn);
        txtMensagemT17 = findViewById(R.id.txtMensagemT17);

        if(MainActivity.lingua==1){
            passartela17.setText("próximo");
            txtMensagemT17.setText("Ansiedade é normal, todos se sentem ansiosos as vezes...");
        } else {
            passartela17.setText("Vamos a seguir");
            txtMensagemT17.setText("La ansiedad es normal, todo el mundo se siente ansioso a veces...");
        }

        passartela17.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent i = new Intent(tela17_activity.this, telaquestao2.class);
                startActivity(i);
            }
        });
    }

    public void onBackPressed() {
        // não chame o super desse método
    }

}