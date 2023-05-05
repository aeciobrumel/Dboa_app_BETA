package com.example.myapplication;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

public class tela2_activity2 extends AppCompatActivity {
    private TextView txtMensagemT2;
    private Button passartela2;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_tela2);

        getSupportActionBar().hide();
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
        );

        txtMensagemT2 = findViewById(R.id.txtMensagemT2);
        passartela2 = findViewById(R.id.passarTela3btn);
        if(MainActivity.lingua==1){
            passartela2.setText("Avançar");
            txtMensagemT2.setText("Ponha os fones de ouvido");
        } else {
            passartela2.setText("Vamos a seguir");
            txtMensagemT2.setText("ponte los auriculares");
        }



        passartela2.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent i = new Intent(tela2_activity2.this, tela3_activity.class);
                startActivity(i);
            }
        });
    }

    @Override
    public void onBackPressed() {
        // não chame o super desse método
    }
}