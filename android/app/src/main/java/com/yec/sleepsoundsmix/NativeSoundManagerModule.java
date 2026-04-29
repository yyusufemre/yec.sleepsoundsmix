package com.yec.sleepsoundsmix;

import android.media.AudioAttributes;
import android.media.MediaPlayer;
import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.util.HashMap;
import java.util.Map;

public class NativeSoundManagerModule extends ReactContextBaseJavaModule {
    private static final String TAG = "NativeSoundManager";
    private final HashMap<String, MediaPlayer> players = new HashMap<>();

    NativeSoundManagerModule(ReactApplicationContext context) {
        super(context);
    }

    @Override
    public String getName() {
        return "NativeSoundManager";
    }

    @ReactMethod
    public void play(String id, String url, float volume) {
        if (players.containsKey(id)) {
            MediaPlayer mp = players.get(id);
            if (mp != null && !mp.isPlaying()) {
                mp.start();
                mp.setVolume(volume, volume);
            }
            return;
        }

        try {
            MediaPlayer mp = new MediaPlayer();
            mp.setAudioAttributes(
                new AudioAttributes.Builder()
                    .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                    .setUsage(AudioAttributes.USAGE_MEDIA)
                    .build()
            );
            mp.setDataSource(url);
            mp.setLooping(true);
            mp.setVolume(volume, volume);
            mp.setOnPreparedListener(new MediaPlayer.OnPreparedListener() {
                @Override
                public void onPrepared(MediaPlayer mediaPlayer) {
                    mediaPlayer.start();
                }
            });
            mp.setOnErrorListener(new MediaPlayer.OnErrorListener() {
                @Override
                public boolean onError(MediaPlayer mediaPlayer, int what, int extra) {
                    Log.e(TAG, "Error playing " + id + ": what=" + what + " extra=" + extra);
                    return false;
                }
            });
            mp.prepareAsync();
            players.put(id, mp);
        } catch (Exception e) {
            Log.e(TAG, "Exception playing " + id, e);
        }
    }

    @ReactMethod
    public void setVolume(String id, float volume) {
        MediaPlayer mp = players.get(id);
        if (mp != null) {
            mp.setVolume(volume, volume);
        }
    }

    @ReactMethod
    public void pauseAll() {
        for (Map.Entry<String, MediaPlayer> entry : players.entrySet()) {
            MediaPlayer mp = entry.getValue();
            if (mp != null && mp.isPlaying()) {
                mp.pause();
            }
        }
    }

    @ReactMethod
    public void resumeAll() {
        for (Map.Entry<String, MediaPlayer> entry : players.entrySet()) {
            MediaPlayer mp = entry.getValue();
            if (mp != null && !mp.isPlaying()) {
                mp.start();
            }
        }
    }

    @ReactMethod
    public void stopAll() {
        for (Map.Entry<String, MediaPlayer> entry : players.entrySet()) {
            MediaPlayer mp = entry.getValue();
            if (mp != null) {
                if (mp.isPlaying()) {
                    mp.stop();
                }
                mp.release();
            }
        }
        players.clear();
    }

    @ReactMethod
    public void stop(String id) {
        MediaPlayer mp = players.get(id);
        if (mp != null) {
            if (mp.isPlaying()) {
                mp.stop();
            }
            mp.release();
            players.remove(id);
        }
    }
}
