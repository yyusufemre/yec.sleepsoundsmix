#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(NativeSoundManager, RCTEventEmitter)

RCT_EXTERN_METHOD(play:(NSString *)id source:(NSString *)source volume:(float)volume)
RCT_EXTERN_METHOD(setVolume:(NSString *)id volume:(float)volume)
RCT_EXTERN_METHOD(playMetronomeTick:(float)volume)
RCT_EXTERN_METHOD(pauseAll)
RCT_EXTERN_METHOD(resumeAll)
RCT_EXTERN_METHOD(stopAll)
RCT_EXTERN_METHOD(stop:(NSString *)id)
RCT_EXTERN_METHOD(scheduleHardStop:(NSString *)deadlineId hardStopTimestampMs:(double)hardStopTimestampMs autoFinishActivity:(BOOL)autoFinishActivity)
RCT_EXTERN_METHOD(cancelHardStop:(NSString *)deadlineId)
RCT_EXTERN_METHOD(getLastCompletedHardStop:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

@end
