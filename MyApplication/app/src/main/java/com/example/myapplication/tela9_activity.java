package com.example.myapplication;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

public class tela9_activity extends AppCompatActivity {

    private TextView txtMensagemT9;
    private Button passartela9;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_tela9);

        getSupportActionBar().hide();
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
        );


        passartela9 = findViewById(R.id.passartela10btn);
        txtMensagemT9 = findViewById(R.id.txtMensagemT9);

        if(MainActivity.lingua==1){
            passartela9.setText("próximo");
            txtMensagemT9.setText("1 coisa que pode sentir o gosto");
        } else {
            passartela9.setText("Vamos a seguir");
            txtMensagemT9.setText("1 cosa que puedes probar");
        }

        passartela9.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent i = new Intent(tela9_activity.this, telaquestao1.class);
                startActivity(i);
            }
        });
    }

    public void onBackPressed() {
        // não chame o super desse método
    }

}