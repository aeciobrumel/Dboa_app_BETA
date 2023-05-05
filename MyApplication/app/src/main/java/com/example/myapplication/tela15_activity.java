package com.example.myapplication;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

public class tela15_activity extends AppCompatActivity {

    private TextView txtMensagemT15;
    private Button passartela15;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_tela15);

        getSupportActionBar().hide();
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
        );


        passartela15 = findViewById(R.id.passartela16btn);
        txtMensagemT15 = findViewById(R.id.txtMensagemT15);

        if(MainActivity.lingua==1){
            passartela15.setText("próximo");
            txtMensagemT15.setText("Você não precisa detectar nada... é justamente esse hiperfoco nas sensações internas que te deixa mais ansioso. você pode direcionar a atenção para coisas que estejam fora de você, descreva a cor e a forma de 5 coisas que o cercam");
        } else {
            passartela15.setText("Vamos a seguir");
            txtMensagemT15.setText("No necesitas detectar nada... es precisamente este hiperfoco en las sensaciones internas lo que te pone más ansioso. puedes dirigir la atención a las cosas que están fuera de ti, describir el color y la forma de 5 cosas que te rodean");
        }


        passartela15.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent i = new Intent(tela15_activity.this, tela16_activity.class);
                startActivity(i);
            }
        });
    }

    public void onBackPressed() {
        // não chame o super desse método
    }

}