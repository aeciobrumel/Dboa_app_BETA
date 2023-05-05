package com.example.myapplication;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

public class tela5_activity extends AppCompatActivity {
    private TextView txtMensagemT5;
    private Button passartela5;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_tela5);

        getSupportActionBar().hide();
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
        );


        passartela5 = findViewById(R.id.passartela6btn);

        MainActivity.mp.setVolume(MainActivity.volume(60), MainActivity.volume(60));


        passartela5.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent i = new Intent(tela5_activity.this, tela6_activity.class);
                startActivity(i);
            }
        });
        txtMensagemT5 = findViewById(R.id.txtMensagemT5);

        if(MainActivity.lingua==1){
            passartela5.setText("Avançar");
            txtMensagemT5.setText("Encontre 5 coisas que consegue ver!");
        } else {
            passartela5.setText("Vamos a seguir");
            txtMensagemT5.setText("¡Encuentra 5 cosas que puedas ver!");
        }


    }

    public void onBackPressed() {
        // não chame o super desse método
    }

}