package com.example.myapplication;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.media.MediaPlayer;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;

public class MainActivity extends AppCompatActivity {
    private ImageView btniniciar;
    private ImageView imgBandeira;

    private TextView txtLingua, txtbtn ;
    public static MediaPlayer mp;
    public static int lingua = 1; //  1 - Português | 2 - Espanhol
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        getSupportActionBar().hide();
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
        );

        btniniciar = findViewById(R.id.iniciarbtn);

        mp = MediaPlayer.create(this, R.raw.fundo);

        imgBandeira = findViewById(R.id.imgBandeira);
        txtLingua = findViewById(R.id.txtLingua);
        txtbtn = findViewById(R.id.txtbtn);

        imgBandeira.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                if(lingua==1){
                    txtLingua.setText("Haga clic en la bandera para cambiar el idioma");
                    txtbtn.setText("Haga clic en el botón para comenzar");
                    imgBandeira.setImageResource(R.drawable.espanha);
                    lingua = 2;
                } else {
                    txtLingua.setText("Clique na bandeira para alterar a língua");
                    txtbtn.setText("Clique no botão para iniciar");
                    imgBandeira.setImageResource(R.drawable.brasil);
                    lingua = 1;
                }
            }
        });

    btniniciar.setOnClickListener(new View.OnClickListener() {
        @Override
        public void onClick(View view) {
            Intent i = new Intent(MainActivity.this, tela1_activity.class);
            //Intent i = new Intent(MainActivity.this, tela_exemplo_layout.class);
            startActivity(i);
        }
    });


    }

    public static float volume(int volumeDesejado){
        return (volumeDesejado*1f)/(100f);
    }

    @Override
    public void onBackPressed() {
        // não chame o super desse método
    }

}