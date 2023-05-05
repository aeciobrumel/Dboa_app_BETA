package com.example.myapplication;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

public class tela10_activity extends AppCompatActivity {

    private TextView txtMensagemT10;
    private Button passartela10;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_tela10);

        getSupportActionBar().hide();
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
        );


        passartela10 = findViewById(R.id.passartela11btn);
        txtMensagemT10 = findViewById(R.id.txtMensagemT10);

        if(MainActivity.lingua==1){
            passartela10.setText("próximo");
            txtMensagemT10.setText("A ansiedade é um mecanismo necessario que quer me proteger, que nos alerta sobre um perigo iminente, mas agora olhando a sua volta, pense ''que perigo eu vejo?'' Não há perigo nenhum... ");
        } else {
            passartela10.setText("Vamos a seguir");
            txtMensagemT10.setText("La ansiedad es un mecanismo necesario que me quiere proteger, que nos advierte de un peligro inminente, pero ahora mirando a tu alrededor, piensa \"¿qué peligro veo?\" No hay peligro en absoluto...");
        }

        passartela10.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent i = new Intent(tela10_activity.this, tela11_activity.class);
                startActivity(i);
            }
        });
    }

    public void onBackPressed() {
        // não chame o super desse método
    }

}