package com.example.myapplication;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.media.MediaPlayer;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.widget.VideoView;

public class tela_exemplo_layout extends AppCompatActivity {

    VideoView vdv;
    int contVideo = 0;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    setContentView(R.layout.activity_tela_exemplo_layout);

    getSupportActionBar().hide();
    getWindow().getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_FULLSCREEN
                                | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
    );

    vdv = findViewById(R.id.videoView);

    Uri caminho = Uri.parse("android.resource://" + getPackageName() + "/" + R.raw.respira);
        vdv.setVideoURI(caminho);

        vdv.setOnCompletionListener(new MediaPlayer.OnCompletionListener() {

        @Override
        public void onCompletion(MediaPlayer mp) {
            contVideo++;
            if( contVideo < 3 ){
                vdv.seekTo(0);
                vdv.start();
            } else {
                Intent i = new Intent(tela_exemplo_layout.this, tela1_activity.class);
                startActivity(i);
            }

        }
    });

        vdv.start();


}


}