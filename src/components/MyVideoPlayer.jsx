import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import 'videojs-youtube';
import { Maximize, Minimize, FastForward, Rewind, Play, Pause } from 'lucide-react';
import { createRoot } from 'react-dom/client';

const MyVideoPlayer = forwardRef(({ videoUrl }, ref) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  
  // Gesture State Refs
  const touchStartTime = useRef(0);
  const lastTapTime = useRef(0);
  const startX = useRef(0);
  const startY = useRef(0);
  const isDragging = useRef(false);
  const tapTimeout = useRef(null);
  const overlayRef = useRef(null);
  const seekOverlayRoot = useRef(null); // React root for overlay

  // Parent Access
  useImperativeHandle(ref, () => ({
    currentTime: () => playerRef.current ? playerRef.current.currentTime() : 0
  }));

  useEffect(() => {
    if (!playerRef.current) {
      const videoElement = document.createElement("video-js");
      videoElement.classList.add('vjs-big-play-centered');
      videoRef.current.appendChild(videoElement);

      const player = playerRef.current = videojs(videoElement, {
        autoplay: false,
        controls: true,
        responsive: true,
        fluid: true,
        techOrder: ['youtube'],
        sources: [{ type: 'video/youtube', src: videoUrl }],
        playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
        youtube: { ytControls: 0, modestbranding: 1, rel: 0, playsinline: 1 }
      });

      player.ready(() => {
        setupGestures(player);
      });
    } else {
      playerRef.current.src({ type: 'video/youtube', src: videoUrl });
    }
  }, [videoUrl]);

  useEffect(() => {
    return () => {
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  const setupGestures = (player) => {
    const playerEl = player.el();

    // 1. Create Transparent Touch Overlay
    const overlay = document.createElement('div');
    overlay.className = 'vjs-touch-overlay';
    playerEl.appendChild(overlay);
    overlayRef.current = overlay;

    // 2. Create UI Layers for Animations
    const animLayer = document.createElement('div');
    animLayer.className = 'vjs-anim-layer';
    playerEl.appendChild(animLayer);

    // 3. Create Seek Feedback Overlay (React Root)
    const seekLayer = document.createElement('div');
    seekLayer.className = 'vjs-seek-feedback hidden';
    playerEl.appendChild(seekLayer);
    seekOverlayRoot.current = createRoot(seekLayer);

    // --- HELPER: Render Seek UI ---
    const updateSeekUI = (diff, current, duration) => {
      seekLayer.classList.remove('hidden');
      const targetTime = Math.max(0, Math.min(current + diff, duration));
      const sign = diff > 0 ? '+' : '-';
      
      seekOverlayRoot.current.render(
        <div className="flex flex-col items-center justify-center text-white drop-shadow-md">
          <div className="text-3xl font-bold mb-2">
            {diff > 0 ? <FastForward size={48}/> : <Rewind size={48}/>}
          </div>
          <div className="text-xl font-mono bg-black/50 px-3 py-1 rounded">
            {formatTime(targetTime)} <span className="text-sm text-gray-300">({sign}{Math.abs(Math.round(diff))}s)</span>
          </div>
        </div>
      );
    };

    // --- TOUCH EVENT HANDLERS ---

    const onTouchStart = (e) => {
      touchStartTime.current = new Date().getTime();
      startX.current = e.touches[0].clientX;
      startY.current = e.touches[0].clientY;
      isDragging.current = false;
    };

    const onTouchMove = (e) => {
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const diffX = currentX - startX.current;
      const diffY = currentY - startY.current;

      // Detect Swipe (Horizontal) - Ignore vertical scrolling
      if (Math.abs(diffX) > 20 && Math.abs(diffX) > Math.abs(diffY)) {
        isDragging.current = true;
        // Prevent page scroll
        if(e.cancelable) e.preventDefault(); 

        // Calculate Seek Seconds (1px = 0.2s approx)
        const seekSeconds = diffX * 0.2;
        updateSeekUI(seekSeconds, player.currentTime(), player.duration());
      }
    };

    const onTouchEnd = (e) => {
      // --- SWIPE END LOGIC ---
      if (isDragging.current) {
        const endX = e.changedTouches[0].clientX;
        const diffX = endX - startX.current;
        const seekSeconds = diffX * 0.2;
        
        player.currentTime(player.currentTime() + seekSeconds);
        
        // Hide Seek UI
        setTimeout(() => {
            seekLayer.classList.add('hidden');
            seekOverlayRoot.current.render(null);
        }, 200);
        
        isDragging.current = false;
        return;
      }

      // --- TAP LOGIC ---
      const currentTime = new Date().getTime();
      const tapLength = currentTime - touchStartTime.current;

      // If held too long, ignore as tap
      if (tapLength > 300) return;

      // DOUBLE TAP CHECK
      const timeSinceLastTap = currentTime - lastTapTime.current;
      
      if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
        // DOUBLE TAP DETECTED
        clearTimeout(tapTimeout.current);
        const rect = overlay.getBoundingClientRect();
        const x = e.changedTouches[0].clientX - rect.left;
        const width = rect.width;

        if (x < width * 0.35) {
          // Left Double Tap (-10s)
          player.currentTime(player.currentTime() - 10);
          showAnimation(animLayer, 'left');
        } else if (x > width * 0.65) {
          // Right Double Tap (+10s)
          player.currentTime(player.currentTime() + 10);
          showAnimation(animLayer, 'right');
        } else {
          // Center Double Tap (Fullscreen)
          if (player.isFullscreen()) {
            player.exitFullscreen();
            showAnimation(animLayer, 'minimize');
          } else {
            player.requestFullscreen();
            showAnimation(animLayer, 'maximize');
          }
        }
        lastTapTime.current = 0; // Reset
      } else {
        // SINGLE TAP DETECTED (Wait to see if it becomes double)
        tapTimeout.current = setTimeout(() => {
          if (player.paused()) {
            player.play();
            showAnimation(animLayer, 'play');
          } else {
            player.pause();
            showAnimation(animLayer, 'pause');
          }
        }, 300);
        lastTapTime.current = currentTime;
      }
    };

    // Attach Listeners
    overlay.addEventListener('touchstart', onTouchStart, { passive: false });
    overlay.addEventListener('touchmove', onTouchMove, { passive: false });
    overlay.addEventListener('touchend', onTouchEnd);
  };

  // Helper: Visual Feedback Animations
  const showAnimation = (container, type) => {
    const el = document.createElement('div');
    el.className = `vjs-anim-icon ${type}`;
    
    // Icon Logic
    let iconHtml = '';
    if (type === 'left') iconHtml = '<div class="icon-circle">⏪ 10s</div>';
    if (type === 'right') iconHtml = '<div class="icon-circle">10s ⏩</div>';
    if (type === 'play') iconHtml = '<div class="icon-circle shadow">▶</div>';
    if (type === 'pause') iconHtml = '<div class="icon-circle shadow">⏸</div>';
    if (type === 'maximize') iconHtml = '<div class="icon-circle shadow">⛶</div>';
    if (type === 'minimize') iconHtml = '<div class="icon-circle shadow">✕</div>';

    el.innerHTML = iconHtml;
    container.appendChild(el);

    // Remove after animation
    setTimeout(() => el.remove(), 600);
  };

  // Helper: Time Formatter
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="video-container relative w-full h-full">
      <div ref={videoRef} onContextMenu={e => e.preventDefault()} />
    </div>
  );
});

export default MyVideoPlayer;