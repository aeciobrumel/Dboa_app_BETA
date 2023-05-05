package com.example.myapplication;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

public class tela7_activity extends AppCompatActivity {
    private TextView txtMensagemT7;
    private Button passartela7;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_tela7);


        passartela7 = findViewById(R.id.passartela8btn);
        txtMensagemT7 = findViewById(R.id.txtMensagemT7);

        if(MainActivity.lingua==1){
            passartela7.setText("próximo");
            txtMensagemT7.setText("Agora, encontre 3 coisas que pode ouvir");
        } else {
            passartela7.setText("Vamos a seguir");
            txtMensagemT7.setText("Ahora encuentra 3 cosas que puedes escuchar");
        }




        getSupportActionBar().hide();
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
        );


        passartela7.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent i = new Intent(tela7_activity.this, tela8_activity.class);
                startActivity(i);
            }
        });
    }

    public void onBackPressed() {
        // não chame o super desse método
    }

}