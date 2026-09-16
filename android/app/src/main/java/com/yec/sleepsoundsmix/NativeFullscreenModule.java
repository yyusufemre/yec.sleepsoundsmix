package com.yec.sleepsoundsmix;

import android.app.Activity;
import android.os.Handler;
import android.os.Looper;
import android.view.View;
import android.view.Window;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class NativeFullscreenModule extends ReactContextBaseJavaModule {
    private static boolean immersiveEnabled = false;

    NativeFullscreenModule(ReactApplicationContext context) {
        super(context);
    }

    @Override
    public String getName() {
        return "NativeFullscreen";
    }

    @ReactMethod
    public void enterImmersive() {
        Activity activity = getCurrentActivity();
        if (activity == null) return;
        immersiveEnabled = true;

        activity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                Window window = activity.getWindow();
                View decorView = window.getDecorView();
                applyImmersive(decorView);
                decorView.setOnSystemUiVisibilityChangeListener(new View.OnSystemUiVisibilityChangeListener() {
                    @Override
                    public void onSystemUiVisibilityChange(int visibility) {
                        if (immersiveEnabled && (visibility & View.SYSTEM_UI_FLAG_HIDE_NAVIGATION) == 0) {
                            applyImmersive(decorView);
                        }
                    }
                });
                Handler handler = new Handler(Looper.getMainLooper());
                handler.postDelayed(new Runnable() {
                    @Override
                    public void run() {
                        if (immersiveEnabled) applyImmersive(decorView);
                    }
                }, 250);
                handler.postDelayed(new Runnable() {
                    @Override
                    public void run() {
                        if (immersiveEnabled) applyImmersive(decorView);
                    }
                }, 1000);
            }
        });
    }

    @ReactMethod
    public void exitImmersive() {
        Activity activity = getCurrentActivity();
        if (activity == null) return;
        immersiveEnabled = false;

        activity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                View decorView = activity.getWindow().getDecorView();
                decorView.setOnSystemUiVisibilityChangeListener(null);
                decorView.setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_LAYOUT_STABLE |
                    View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                );
            }
        });
    }

    public static boolean isImmersiveEnabled() {
        return immersiveEnabled;
    }

    public static void applyImmersive(View decorView) {
        decorView.setSystemUiVisibility(getImmersiveFlags());
    }

    private static int getImmersiveFlags() {
        return View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY |
            View.SYSTEM_UI_FLAG_FULLSCREEN |
            View.SYSTEM_UI_FLAG_HIDE_NAVIGATION |
            View.SYSTEM_UI_FLAG_LAYOUT_STABLE |
            View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN |
            View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION;
    }
}
