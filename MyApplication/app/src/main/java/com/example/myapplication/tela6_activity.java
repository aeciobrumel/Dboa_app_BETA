package com.example.myapplication;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

public class tela6_activity extends AppCompatActivity {
    private TextView txtMensagemT6;
    private Button passartela6;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_tela6);

        getSupportActionBar().hide();
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
        );


        passartela6 = findViewById(R.id.passartela7btn);
        txtMensagemT6 = findViewById(R.id.txtMensagemT6);

        if(MainActivity.lingua==1){
            passartela6.setText("próximo");
            txtMensagemT6.setText("Encontre 4 coisas que consegue tocar");
        } else {
            passartela6.setText("Vamos a seguir");
            txtMensagemT6.setText("Encuentra 4 cosas que puedes tocar");
        }


        passartela6.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent i = new Intent(tela6_activity.this, tela7_activity.class);
                startActivity(i);
            }
        });
    }


    public void onBackPressed() {
        // não chame o super desse método
    }

}