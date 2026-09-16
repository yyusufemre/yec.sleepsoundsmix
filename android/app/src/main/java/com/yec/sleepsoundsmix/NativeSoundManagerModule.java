package com.yec.sleepsoundsmix;

import android.media.AudioAttributes;
import android.media.AudioFormat;
import android.media.AudioTrack;
import android.media.MediaPlayer;
import android.util.Log;
import android.content.res.AssetFileDescriptor;

import android.os.Handler;
import android.os.Looper;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;

import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class NativeSoundManagerModule extends ReactContextBaseJavaModule {
    private static final String TAG = "NativeSoundManager";
    private final HashMap<String, MediaPlayer> players = new HashMap<>();
    private final HashSet<AudioTrack> activeAudioTracks = new HashSet<>();
    private final ExecutorService downloadExecutor = Executors.newFixedThreadPool(2);
    private final HashSet<String> downloadingUrls = new HashSet<>();

    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    private String activeDeadlineId = null;
    private Runnable pendingHardStopRunnable = null;
    private volatile boolean isHardStopped = false;

    private String lastCompletedHardStopId = null;
    private long lastCompletedHardStopTimestamp = 0;
    private boolean lastCompletedDidCleanup = false;

    NativeSoundManagerModule(ReactApplicationContext context) {
        super(context);
    }

    @Override
    public String getName() {
        return "NativeSoundManager";
    }

    @Override
    public void invalidate() {
        super.invalidate();
        stopAll();
        downloadExecutor.shutdownNow();
    }

    @ReactMethod
    public void play(String id, String source, float volume) {
        isHardStopped = false;
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

            // Handle Caching or Local Resource
            if (source.startsWith("http")) {
                String localPath = checkCacheAndDownload(source);
                if (localPath != null) {
                    mp.setDataSource(localPath);
                } else {
                    mp.setDataSource(source);
                }
            } else if (source.startsWith("/") || source.startsWith("file://")) {
                mp.setDataSource(source);
            } else {
                // Try to handle as resource ID (if numeric)
                try {
                    int resId = Integer.parseInt(source);
                    AssetFileDescriptor afd = getReactApplicationContext().getResources().openRawResourceFd(resId);
                    if (afd != null) {
                        mp.setDataSource(afd.getFileDescriptor(), afd.getStartOffset(), afd.getLength());
                        afd.close();
                    }
                } catch (NumberFormatException e) {
                    // Not a resource ID, try as direct path
                    mp.setDataSource(source);
                }
            }

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
                    players.remove(id);
                    try {
                        mediaPlayer.release();
                    } catch (Exception ignored) {}
                    return true;
                }
            });
            mp.prepareAsync();
            players.put(id, mp);
        } catch (Exception e) {
            Log.e(TAG, "Exception playing " + id, e);
        }
    }

    private void sendEvent(String eventName, WritableMap params) {
        try {
            if (getReactApplicationContext().hasActiveReactInstance()) {
                getReactApplicationContext()
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit(eventName, params);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error emitting event: " + eventName, e);
        }
    }

    @ReactMethod
    public void addListener(String eventName) {
        // Keep: Required for RN NativeEventEmitter
    }

    @ReactMethod
    public void removeListeners(double count) {
        // Keep: Required for RN NativeEventEmitter
    }

    private void cancelHardStopInternal() {
        if (pendingHardStopRunnable != null) {
            mainHandler.removeCallbacks(pendingHardStopRunnable);
            pendingHardStopRunnable = null;
        }
        activeDeadlineId = null;
    }

    @ReactMethod
    public void cancelHardStop(String deadlineId) {
        if (deadlineId != null && deadlineId.equals(activeDeadlineId)) {
            cancelHardStopInternal();
            Log.d(TAG, "Canceled hard stop for deadline: " + deadlineId);
        }
    }

    @ReactMethod
    public void scheduleHardStop(final String deadlineId, final double hardStopTimestampMs, final boolean autoFinishActivity) {
        cancelHardStopInternal();
        if (deadlineId == null || deadlineId.trim().isEmpty()) return;

        this.isHardStopped = false; // Reset ONLY when scheduling a new valid timer session
        this.activeDeadlineId = deadlineId;
        long now = System.currentTimeMillis();
        long delayMs = Math.max(0, (long) (hardStopTimestampMs - now));

        Log.d(TAG, "Scheduling hard stop ID: " + deadlineId + " in " + delayMs + "ms (timestamp: " + (long) hardStopTimestampMs + ")");

        pendingHardStopRunnable = new Runnable() {
            @Override
            public void run() {
                // Race condition check: Verify callback ID matches activeDeadlineId
                if (activeDeadlineId == null || !activeDeadlineId.equals(deadlineId)) {
                    Log.d(TAG, "Hard stop skipped: ID mismatch. Expected: " + deadlineId + ", Active: " + activeDeadlineId);
                    return;
                }

                Log.d(TAG, "Executing hard stop callback for deadline ID: " + deadlineId);
                isHardStopped = true;
                lastCompletedHardStopId = deadlineId;
                lastCompletedHardStopTimestamp = System.currentTimeMillis();

                // 1. Audio Cleanup: Stop all native players & metronome AudioTracks & TrackPlayer
                try {
                    stopAll();
                    lastCompletedDidCleanup = true;
                    sendEvent("onNativeHardStopExecuted", null);
                } catch (Exception e) {
                    Log.e(TAG, "Error in stopAll() during hard stop execution", e);
                }

                // 2. Finish Activity if requested (null safe, won't crash if Activity is null)
                if (autoFinishActivity) {
                    try {
                        android.app.Activity activity = getCurrentActivity();
                        if (activity != null && !activity.isFinishing()) {
                            Log.d(TAG, "Finishing activity on hard stop...");
                            activity.finishAndRemoveTask();
                        } else {
                            Log.w(TAG, "Activity was null or already finishing when hard stop triggered.");
                        }
                    } catch (Exception e) {
                        Log.e(TAG, "Error finishing activity during hard stop execution", e);
                    }
                }
            }
        };

        mainHandler.postDelayed(pendingHardStopRunnable, delayMs);
    }

    @ReactMethod
    public void getLastCompletedHardStop(Promise promise) {
        WritableMap map = Arguments.createMap();
        map.putString("lastCompletedId", lastCompletedHardStopId);
        map.putDouble("timestamp", (double) lastCompletedHardStopTimestamp);
        map.putBoolean("didCleanup", lastCompletedDidCleanup);
        promise.resolve(map);
    }

    private String checkCacheAndDownload(final String urlString) {
        try {
            String filename = urlString.substring(urlString.lastIndexOf("/") + 1);
            // Basic sanitization
            filename = filename.split("\\?")[0];

            File cacheDir = getReactApplicationContext().getCacheDir();
            final File cacheFile = new File(cacheDir, filename);

            if (cacheFile.exists() && cacheFile.length() > 0) {
                Log.d(TAG, "Playing from cache: " + filename);
                return cacheFile.getAbsolutePath();
            }

            // Not in cache, start background download if not already downloading
            synchronized (downloadingUrls) {
                if (!downloadingUrls.contains(urlString)) {
                    downloadingUrls.add(urlString);
                    downloadExecutor.execute(new Runnable() {
                        @Override
                        public void run() {
                            downloadToCache(urlString, cacheFile);
                        }
                    });
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Cache check error", e);
        }
        return null; // Fallback to network URL
    }

    private void downloadToCache(String urlString, File outputFile) {
        InputStream input = null;
        FileOutputStream output = null;
        HttpURLConnection connection = null;
        File tempFile = new File(outputFile.getAbsolutePath() + ".part");
        try {
            Log.d(TAG, "Downloading to cache: " + urlString);
            URL url = new URL(urlString);
            connection = (HttpURLConnection) url.openConnection();
            connection.setConnectTimeout(8000);
            connection.setReadTimeout(12000);
            connection.connect();

            if (connection.getResponseCode() != HttpURLConnection.HTTP_OK) {
                return;
            }

            input = connection.getInputStream();
            output = new FileOutputStream(tempFile);

            byte[] data = new byte[4096];
            int count;
            while ((count = input.read(data)) != -1) {
                output.write(data, 0, count);
            }
            output.flush();

            if (outputFile.exists() && !outputFile.delete()) {
                Log.w(TAG, "Could not replace existing cache file: " + outputFile.getName());
            }
            if (!tempFile.renameTo(outputFile)) {
                throw new Exception("Could not finalize cache file: " + outputFile.getName());
            }
            Log.d(TAG, "Download complete: " + outputFile.getName());
        } catch (Exception e) {
            Log.e(TAG, "Download error: " + urlString, e);
        } finally {
            try {
                if (output != null) output.close();
                if (input != null) input.close();
            } catch (Exception ignored) {}
            if (connection != null) connection.disconnect();
            if (tempFile.exists()) {
                tempFile.delete();
            }
            synchronized (downloadingUrls) {
                downloadingUrls.remove(urlString);
            }
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
    public void playMetronomeTick(float volume) {
        if (isHardStopped) return;

        final float safeVolume = Math.max(0f, Math.min(1f, volume));
        downloadExecutor.execute(new Runnable() {
            @Override
            public void run() {
                if (isHardStopped) return;

                final int sampleRate = 44100;
                final int durationMs = 80;
                final int sampleCount = sampleRate * durationMs / 1000;
                final byte[] buffer = new byte[sampleCount * 2];
                final double frequency = 440.0;

                for (int i = 0; i < sampleCount; i++) {
                    double t = i / (double) sampleRate;
                    double envelope = Math.exp(-t / 0.025);
                    double sample = Math.sin(2.0 * Math.PI * frequency * t) * envelope * safeVolume * 0.55;
                    short value = (short) Math.max(Short.MIN_VALUE, Math.min(Short.MAX_VALUE, sample * Short.MAX_VALUE));
                    buffer[i * 2] = (byte) (value & 0xff);
                    buffer[i * 2 + 1] = (byte) ((value >> 8) & 0xff);
                }

                try {
                    final AudioTrack track = new AudioTrack.Builder()
                        .setAudioAttributes(new AudioAttributes.Builder()
                            .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                            .setUsage(AudioAttributes.USAGE_MEDIA)
                            .build())
                        .setAudioFormat(new AudioFormat.Builder()
                            .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                            .setSampleRate(sampleRate)
                            .setChannelMask(AudioFormat.CHANNEL_OUT_MONO)
                            .build())
                        .setBufferSizeInBytes(buffer.length)
                        .setTransferMode(AudioTrack.MODE_STATIC)
                        .build();

                    synchronized (activeAudioTracks) {
                        if (isHardStopped) {
                            track.release();
                            return;
                        }
                        activeAudioTracks.add(track);
                    }

                    track.write(buffer, 0, buffer.length);
                    track.setNotificationMarkerPosition(sampleCount);
                    track.setPlaybackPositionUpdateListener(new AudioTrack.OnPlaybackPositionUpdateListener() {
                        @Override
                        public void onMarkerReached(AudioTrack audioTrack) {
                            synchronized (activeAudioTracks) {
                                activeAudioTracks.remove(audioTrack);
                            }
                            try {
                                audioTrack.stop();
                                audioTrack.release();
                            } catch (Exception ignored) {}
                        }

                        @Override
                        public void onPeriodicNotification(AudioTrack audioTrack) {}
                    });
                    track.play();
                } catch (Exception e) {
                    Log.e(TAG, "Metronome tick error", e);
                }
            }
        });
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
        // 1. Stop and release all MediaPlayers
        for (Map.Entry<String, MediaPlayer> entry : players.entrySet()) {
            MediaPlayer mp = entry.getValue();
            if (mp != null) {
                try {
                    if (mp.isPlaying()) {
                        mp.stop();
                    }
                    mp.release();
                } catch (Exception ignored) {}
            }
        }
        players.clear();

        // 2. Stop and release all active AudioTracks (Metronome)
        synchronized (activeAudioTracks) {
            for (AudioTrack track : activeAudioTracks) {
                try {
                    if (track.getPlayState() == AudioTrack.PLAYSTATE_PLAYING) {
                        track.stop();
                    }
                    track.release();
                } catch (Exception ignored) {}
            }
            activeAudioTracks.clear();
        }

        // 3. Stop TrackPlayer Foreground Service & Notification
        try {
            android.content.Intent serviceIntent = new android.content.Intent(
                getReactApplicationContext(),
                com.doublesymmetry.trackplayer.service.MusicService.class
            );
            getReactApplicationContext().stopService(serviceIntent);
            Log.d(TAG, "TrackPlayer MusicService stopService called successfully.");
        } catch (Exception e) {
            Log.e(TAG, "Error stopping TrackPlayer MusicService", e);
        }
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
