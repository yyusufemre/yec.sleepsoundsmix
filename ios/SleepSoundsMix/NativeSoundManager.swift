import React

class SoundPlayerState {
  var player: AVPlayer
  private var observer: Any?
  private var timeObserver: Any?
  
  init(player: AVPlayer) {
    self.player = player
    
    // Add observer to loop playback
    self.observer = NotificationCenter.default.addObserver(
      forName: .AVPlayerItemDidPlayToEndTime,
      object: player.currentItem,
      queue: .main
    ) { [weak player] _ in
      player?.seek(to: .zero)
      player?.play()
    }
  }
  
  deinit {
    if let observer = observer {
      NotificationCenter.default.removeObserver(observer)
    }
    if let timeObserver = timeObserver {
      player.removeTimeObserver(timeObserver)
    }
  }
}

@objc(NativeSoundManager)
class NativeSoundManager: RCTEventEmitter {

  private var players: [String: SoundPlayerState] = [:]
  private var metronomePlayers: [AVAudioPlayer] = []
  private var downloadingUrls: Set<String> = []
  private let downloadQueue = DispatchQueue(label: "com.yec.sleepsoundsmix.downloadQueue", attributes: .concurrent)

  private var pendingHardStopWorkItem: DispatchWorkItem?
  private var activeDeadlineId: String?
  private var lastCompletedHardStopId: String?
  private var lastCompletedHardStopTimestamp: Double = 0
  private var lastCompletedDidCleanup: Bool = false

  override func supportedEvents() -> [String]! {
    return ["onNativeHardStopExecuted"]
  }

  @objc
  override static func requiresMainQueueSetup() -> Bool {
    return false
  }

  @objc(play:source:volume:)
  func play(id: String, source: String, volume: Float) {
    if let state = players[id] {
      if state.player.timeControlStatus != .playing {
        state.player.play()
        state.player.volume = volume
      }
      return
    }

    if source.hasPrefix("http") {
      if let localPath = checkCacheAndDownload(urlString: source) {
        // Play from cache
        playLocalOrRemote(id: id, path: localPath, volume: volume, isRemote: false)
      } else {
        // Stream immediately from remote URL, while background download happens
        playLocalOrRemote(id: id, path: source, volume: volume, isRemote: true)
      }
    } else {
      // Local file or bundle resource
      var path = source
      if !source.hasPrefix("/") && !source.hasPrefix("file://") {
        // Try to find in main bundle
        if let bundlePath = Bundle.main.path(forResource: source, ofType: nil) {
          path = bundlePath
        } else if let bundlePath2 = Bundle.main.path(forResource: source, ofType: "mp3") {
          path = bundlePath2
        } else if let bundlePath3 = Bundle.main.path(forResource: source, ofType: "m4a") {
          path = bundlePath3
        }
      }
      playLocalOrRemote(id: id, path: path, volume: volume, isRemote: false)
    }
  }

  private func playLocalOrRemote(id: String, path: String, volume: Float, isRemote: Bool) {
    guard let url = isRemote ? URL(string: path) : (URL(string: path.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? path) ?? URL(fileURLWithPath: path)) else {
      return
    }
    
    var finalUrl = url
    if !isRemote && !path.hasPrefix("file://") && !path.hasPrefix("http") {
        finalUrl = URL(fileURLWithPath: path)
    }

    doPlay(id: id, url: finalUrl, volume: volume)
  }

  private func doPlay(id: String, url: URL, volume: Float) {
    DispatchQueue.main.async {
      // Ensure the audio session is active and set to playback in case another module turned it off
      do {
          try AVAudioSession.sharedInstance().setCategory(.playback, options: [.mixWithOthers])
          try AVAudioSession.sharedInstance().setActive(true)
      } catch {
          print("NativeSoundManager failed to set audio session active: \\(error)")
      }
      
      let playerItem = AVPlayerItem(url: url)
      let player = AVPlayer(playerItem: playerItem)
      player.volume = volume
      
      let state = SoundPlayerState(player: player)
      self.players[id] = state
      
      player.play()
    }
  }

  private func checkCacheAndDownload(urlString: String) -> String? {
    guard let url = URL(string: urlString) else { return nil }
    let filename = url.lastPathComponent.components(separatedBy: "?").first ?? UUID().uuidString
    
    let cacheDir = FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask).first!
    let cacheFileUrl = cacheDir.appendingPathComponent(filename)
    
    if FileManager.default.fileExists(atPath: cacheFileUrl.path) {
      if let attributes = try? FileManager.default.attributesOfItem(atPath: cacheFileUrl.path),
         let fileSize = attributes[FileAttributeKey.size] as? UInt64, fileSize > 0 {
        return cacheFileUrl.path
      }
    }
    
    // Start background download to cache
    downloadToCache(urlString: urlString, cacheFileUrl: cacheFileUrl)
    
    return nil
  }

  private func downloadToCache(urlString: String, cacheFileUrl: URL) {
    guard let url = URL(string: urlString) else { return }
    
    downloadQueue.async { [weak self] in
      guard let self = self else { return }
      
      objc_sync_enter(self)
      if self.downloadingUrls.contains(urlString) {
        objc_sync_exit(self)
        return
      }
      self.downloadingUrls.insert(urlString)
      objc_sync_exit(self)
      
      do {
        let data = try Data(contentsOf: url)
        try data.write(to: cacheFileUrl, options: .atomic)
      } catch {
        print("NativeSoundManager download error: \(error.localizedDescription)")
      }
      
      objc_sync_enter(self)
      self.downloadingUrls.remove(urlString)
      objc_sync_exit(self)
    }
  }

  @objc(setVolume:volume:)
  func setVolume(id: String, volume: Float) {
    DispatchQueue.main.async {
      if let state = self.players[id] {
        state.player.volume = volume
      }
    }
  }

  @objc(playMetronomeTick:)
  func playMetronomeTick(volume: Float) {
    DispatchQueue.main.async {
      do {
        try AVAudioSession.sharedInstance().setCategory(.playback, options: [.mixWithOthers])
        try AVAudioSession.sharedInstance().setActive(true)

        let data = self.makeMetronomeTickWav(volume: max(0, min(1, volume)))
        let player = try AVAudioPlayer(data: data)
        player.prepareToPlay()
        self.metronomePlayers.append(player)
        player.play()

        DispatchQueue.main.asyncAfter(deadline: .now() + 0.25) {
          self.metronomePlayers.removeAll { $0 === player }
        }
      } catch {
        print("NativeSoundManager metronome tick error: \(error.localizedDescription)")
      }
    }
  }

  private func makeMetronomeTickWav(volume: Float) -> Data {
    let sampleRate = 44100
    let durationMs = 80
    let sampleCount = sampleRate * durationMs / 1000
    let bytesPerSample = 2
    let dataSize = sampleCount * bytesPerSample
    let frequency = 440.0

    var data = Data()

    func appendString(_ value: String) {
      data.append(value.data(using: .ascii)!)
    }

    func appendUInt16(_ value: UInt16) {
      var littleEndian = value.littleEndian
      data.append(Data(bytes: &littleEndian, count: MemoryLayout<UInt16>.size))
    }

    func appendUInt32(_ value: UInt32) {
      var littleEndian = value.littleEndian
      data.append(Data(bytes: &littleEndian, count: MemoryLayout<UInt32>.size))
    }

    appendString("RIFF")
    appendUInt32(UInt32(36 + dataSize))
    appendString("WAVE")
    appendString("fmt ")
    appendUInt32(16)
    appendUInt16(1)
    appendUInt16(1)
    appendUInt32(UInt32(sampleRate))
    appendUInt32(UInt32(sampleRate * bytesPerSample))
    appendUInt16(UInt16(bytesPerSample))
    appendUInt16(16)
    appendString("data")
    appendUInt32(UInt32(dataSize))

    for index in 0..<sampleCount {
      let t = Double(index) / Double(sampleRate)
      let envelope = exp(-t / 0.025)
      let rawSample = sin(2.0 * Double.pi * frequency * t) * envelope * Double(volume) * 0.55
      let clamped = max(Double(Int16.min), min(Double(Int16.max), rawSample * Double(Int16.max)))
      appendUInt16(UInt16(bitPattern: Int16(clamped)))
    }

    return data
  }

  private var activeDeadlineId: String? = nil
  private var pendingHardStopWorkItem: DispatchWorkItem? = nil
  private var lastCompletedHardStopId: String? = nil
  private var lastCompletedHardStopTimestamp: Double = 0
  private var lastCompletedDidCleanup: Bool = false

  @objc
  func pauseAll() {
    DispatchQueue.main.async {
      for (_, state) in self.players {
        state.player.pause()
      }
    }
  }

  @objc
  func resumeAll() {
    DispatchQueue.main.async {
      for (_, state) in self.players {
        state.player.play()
      }
    }
  }

  @objc
  func stopAll() {
    DispatchQueue.main.async {
      for (_, state) in self.players {
        state.player.pause()
        state.player.replaceCurrentItem(with: nil)
      }
      self.players.removeAll()

      for mp in self.metronomePlayers {
        mp.stop()
      }
      self.metronomePlayers.removeAll()
    }
  }

  @objc(stop:)
  func stop(id: String) {
    DispatchQueue.main.async {
      if let state = self.players[id] {
        state.player.pause()
        state.player.replaceCurrentItem(with: nil)
        self.players.removeValue(forKey: id)
      }
    }
  }

  @objc(cancelHardStop:)
  func cancelHardStop(deadlineId: String) {
    DispatchQueue.main.async {
      if self.activeDeadlineId == deadlineId {
        self.pendingHardStopWorkItem?.cancel()
        self.pendingHardStopWorkItem = nil
        self.activeDeadlineId = nil
      }
    }
  }

  @objc(scheduleHardStop:hardStopTimestampMs:autoFinishActivity:)
  func scheduleHardStop(deadlineId: String, hardStopTimestampMs: Double, autoFinishActivity: Bool) {
    DispatchQueue.main.async {
      self.pendingHardStopWorkItem?.cancel()
      self.activeDeadlineId = deadlineId

      let nowMs = Date().timeIntervalSince1970 * 1000.0
      let delaySeconds = max(0.0, (hardStopTimestampMs - nowMs) / 1000.0)

      let workItem = DispatchWorkItem { [weak self] in
        guard let self = self else { return }
        guard self.activeDeadlineId == deadlineId else { return }

        self.lastCompletedHardStopId = deadlineId
        self.lastCompletedHardStopTimestamp = Date().timeIntervalSince1970 * 1000.0

        self.stopAll()
        self.lastCompletedDidCleanup = true
        self.sendEvent(withName: "onNativeHardStopExecuted", body: nil)
      }

      self.pendingHardStopWorkItem = workItem
      DispatchQueue.main.asyncAfter(deadline: .now() + delaySeconds, execute: workItem)
    }
  }

  @objc(getLastCompletedHardStop:rejecter:)
  func getLastCompletedHardStop(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      resolve([
        "lastCompletedId": self.lastCompletedHardStopId ?? NSNull(),
        "timestamp": self.lastCompletedHardStopTimestamp,
        "didCleanup": self.lastCompletedDidCleanup
      ])
    }
  }
}
