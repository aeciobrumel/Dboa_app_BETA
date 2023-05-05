package com.example.myapplication;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

public class tela8_activity extends AppCompatActivity {

    private TextView txtMensagemT8;
    private Button passartela8;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_tela8);

        getSupportActionBar().hide();
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
        );



        passartela8 = findViewById(R.id.passartela9btn);
        txtMensagemT8 = findViewById(R.id.txtMensagemT8);

        if(MainActivity.lingua==1){
            passartela8.setText("próximo");
            txtMensagemT8.setText("Pense em 2 coisas que pode cheirar");
        } else {
            passartela8.setText("Vamos a seguir");
            txtMensagemT8.setText("Piensa en 2 cosas que puedas oler");
        }

        passartela8.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent i = new Intent(tela8_activity.this, tela9_activity.class);
                startActivity(i);
            }
        });
    }

    public void onBackPressed() {
        // não chame o super desse método
    }

}