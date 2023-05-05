package com.example.myapplication;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;

public class telaquestao1 extends AppCompatActivity {
    private ImageView feliz1, triste1;
    private TextView txtMensagemTeste1;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_telaquestao1);

        getSupportActionBar().hide();
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
        );



        feliz1 = findViewById(R.id.felizbtn1);
        triste1 = findViewById(R.id.tristebtn1);
        txtMensagemTeste1 = findViewById(R.id.txtMensagemTeste1);

        if(MainActivity.lingua==1){
            txtMensagemTeste1.setText("Como se sente?");

        } else {
            txtMensagemTeste1.setText("¿Como se siente?");
        }

        feliz1.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent i = new Intent(telaquestao1.this, MainActivity.class);
                startActivity(i);

            }
        });
        triste1.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent i = new Intent(telaquestao1.this, tela10_activity.class);
                startActivity(i);
            }


        });
    }

    public void onBackPressed() {
        // não chame o super desse método
    }

}