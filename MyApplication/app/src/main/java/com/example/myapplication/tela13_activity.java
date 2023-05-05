package com.example.myapplication;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

public class tela13_activity extends AppCompatActivity {
    private TextView txtMensagemT13;
    private Button passartela13;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_tela13);

        getSupportActionBar().hide();
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
        );


        passartela13 = findViewById(R.id.passartela14btn);
        txtMensagemT13 = findViewById(R.id.txtMensagemT13);

        if(MainActivity.lingua==1){
            passartela13.setText("próximo");
            txtMensagemT13.setText("Lembre-se não tem razão para ter medo. Essas sensações fisicas são causadas apenas pela ansiedade e logo irão embora");
        } else {
            passartela13.setText("Vamos a seguir");
            txtMensagemT13.setText("Recuerda que no hay razón para tener miedo. Estas sensaciones físicas solo son causadas por la ansiedad y pronto desaparecerán.");
        }

        passartela13.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent i = new Intent(tela13_activity.this, tela14_activity.class);
                startActivity(i);
            }
        });
    }

    public void onBackPressed() {
        // não chame o super desse método
    }

}