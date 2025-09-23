document.addEventListener('DOMContentLoaded', async () => {
  shaka.polyfill.installAll();

  if (!shaka.Player.isBrowserSupported()) {
    console.error('Browser not supported');
    return;
  }

  const video = document.querySelector('video');
  const player = new shaka.Player();
  await player.attach(video);

  const container = document.querySelector('.shaka-video-container');
  const ui = new shaka.ui.Overlay(player, container, video);

  ui.configure({
    controlPanelElements: [
      'play_pause', 'time_and_duration', 'mute', 'volume',
      'spacer', 'language', 'captions', 'picture_in_picture',
      'quality', 'fullscreen'
    ],
    volumeBarColors: {
      base: 'rgba(255, 192, 203, 0.3)',
      level: 'rgb(255, 105, 180)'
    },
    seekBarColors: {
      base: 'rgba(255, 255, 0, 0.3)',
      buffered: 'rgba(255, 255, 0, 0.6)',
      played: 'rgb(255, 255, 0)'
    }
  });

  // Base64 Encoded Values
  const drmKey = atob("MzFiMTNjNmYyNDEwNTVhYWE5NjUyNjNmMzExNWU2ODQ=");
  const drmVal = atob("NjFmMGNiYzk1OTk5MjVhN2JlOTNkNDVlMzBiOGViZTk=");
  const cookieHeader = atob("X19oZG5lYV9fPXN0PTE3NTg1NTc0MDV+ZXhwPTE3NTg2NDM4MDV+YWNsPS8qfmhtYWM9YTNhMDQyOTUxM2ZmNDI0YjQ1OWEzNWNhZTg1MWYwNDg3YTdlMmM4NDJjYTdhZDFjN2U5OTAwNGE1N2I1MjQ4OQ==");
  const streamUrl = atob("aHR0cHM6Ly9qaW90dmJwa21vYi5jZG4uamlvLmNvbS9icGstdHYvQXNpYV9DdXBfSGluZGlfTU9CL1dEVkxpdmUvaW5kZXgubXBkP19faGRuZWFfXz1zdD0xNzU4NTU3NDA1fmV4cD0xNzU4NjQzODA1fmFjbD0vKn5obWFjPWEzYTA0Mjk1MTNmZjQyNGI0NTlhMzVjYWU4NTFmMDQ4N2E3ZTJjODQyY2E3YWQxYzdlOTkwMDRhNTdiNTI0ODk=");

  let drmConfig = { clearKeys: { [drmKey]: drmVal } };

  player.configure({
    drm: drmConfig,
    streaming: {
      lowLatencyMode: true,
      bufferingGoal: 15,
      rebufferingGoal: 2,
      bufferBehind: 15,
      retryParameters: { timeout: 10000, maxAttempts: 5, baseDelay: 300, backoffFactor: 1.2 },
      segmentRequestTimeout: 8000,
      segmentPrefetchLimit: 2,
      useNativeHlsOnSafari: true
    },
    manifest: {
      retryParameters: { timeout: 8000, maxAttempts: 3 }
    }
  });

  player.getNetworkingEngine().registerRequestFilter((type, request) => {
    request.headers['Referer'] = 'https://www.jiotv.com/';
    request.headers['User-Agent'] = "plaYtv/7.1.5 (Linux;Android 13) ExoPlayerLib/2.11.6";
    request.headers['Cookie'] = cookieHeader;

    if (
      (type === shaka.net.NetworkingEngine.RequestType.MANIFEST ||
        type === shaka.net.NetworkingEngine.RequestType.SEGMENT) &&
      request.uris[0] && !request.uris[0].includes('__hdnea=')
    ) {
      const separator = request.uris[0].includes('?') ? '&' : '?';
      request.uris[0] += separator + cookieHeader;
    }
  });

  const attemptAutoplay = async () => {
    try {
      video.muted = false;
      await video.play();
      console.log('Unmuted autoplay successful');
      return true;
    } catch {
      try {
        video.muted = true;
        await video.play();
        console.log('Muted autoplay successful');
        return true;
      } catch (err) {
        console.log('Autoplay failed:', err.message);
        return false;
      }
    }
  };

  player.addEventListener('error', (event) => {
    console.error('Shaka Player Error:', event.detail);
  });

  try {
    await player.load(streamUrl);
    if (video.readyState >= 3) {
      await attemptAutoplay();
    } else {
      video.addEventListener('canplay', attemptAutoplay, { once: true });
    }
  } catch (error) {
    console.error('Load error:', error);
  }
});
