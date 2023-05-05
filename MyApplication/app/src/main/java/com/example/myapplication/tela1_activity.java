package com.example.myapplication;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

public class tela1_activity extends AppCompatActivity {
    private Button passartela;
    private TextView txtMensagemT1;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_tela1);

        getSupportActionBar().hide();
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
        );



        passartela = findViewById(R.id.passarTela2btn);
        txtMensagemT1 = findViewById(R.id.txtMensagemT1);
//private TextView txtMensagemT3;

        if(MainActivity.lingua==1){
            passartela.setText("Vamos continuar");
            txtMensagemT1.setText("se possível vá para um ambiente mais calmo!");
        } else {
            passartela.setText("Vamos a seguir");
            txtMensagemT1.setText("si es posible vaya a un ambiente más tranquilo!");
        }

        passartela.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent i = new Intent(tela1_activity.this, tela2_activity2.class);
                startActivity(i);
            }
        });
    }

    @Override
    public void onBackPressed() {
        // não chame o super desse método
    }
}