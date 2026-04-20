/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, Settings, Maximize, RotateCcw, Share2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// ASCII Character sets
const CHAR_SETS = {
  standard: '@#S%?*+;:,. ',
  blocks: '█▓▒░ ',
  minimal: '•· ',
  binary: '01 ',
} as const;

type CharSetName = keyof typeof CHAR_SETS;

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ascii, setAscii] = useState<string>('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Settings
  const [charSet, setCharSet] = useState<CharSetName>('standard');
  const [resolution, setResolution] = useState(120);
  const [contrast, setContrast] = useState(1);
  const [brightness, setBrightness] = useState(1);
  const [isInverted, setIsInverted] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        setError(null);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Camera access denied.');
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [startCamera]);

  useEffect(() => {
    let animationFrameId: number;
    
    const processFrame = () => {
      if (!isCameraActive || !videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      
      if (!ctx || video.videoWidth === 0) {
        animationFrameId = requestAnimationFrame(processFrame);
        return;
      }

      const aspectRatio = video.videoWidth / video.videoHeight;
      const width = resolution;
      const height = Math.floor(resolution / aspectRatio / 1.8);

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(video, 0, 0, width, height);
      const imageData = ctx.getImageData(0, 0, width, height);
      const pixels = imageData.data;
      
      let asciiStr = '';
      const selectedChars = CHAR_SETS[charSet];
      const charCount = selectedChars.length;

      for (let i = 0; i < pixels.length; i += 4) {
        let r = pixels[i];
        let g = pixels[i + 1];
        let b = pixels[i + 2];

        r = Math.min(255, Math.max(0, (r - 128) * contrast + 128 * brightness));
        g = Math.min(255, Math.max(0, (g - 128) * contrast + 128 * brightness));
        b = Math.min(255, Math.max(0, (b - 128) * contrast + 128 * brightness));

        const avg = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
        const charIndex = Math.floor((isInverted ? 1 - avg : avg) * (charCount - 1));
        
        asciiStr += selectedChars[charIndex];

        if (((i / 4) + 1) % width === 0) {
          asciiStr += '\n';
        }
      }

      setAscii(asciiStr);
      animationFrameId = requestAnimationFrame(processFrame);
    };

    animationFrameId = requestAnimationFrame(processFrame);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isCameraActive, resolution, charSet, contrast, brightness, isInverted]);

  return (
    <div className="flex flex-col h-screen w-full bg-bg-base overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-[260px] bg-surface sidebar-border p-6 flex flex-col gap-8 shrink-0">
          <div>
            <h1 className="text-xl font-bold tracking-tighter text-accent flex items-center gap-2">
              <Camera size={18} />
              ASCII.CAM
            </h1>
            <p className="text-[9px] text-accent-label opacity-50 uppercase tracking-widest mt-1">KERNEL VERSION 4.2.0-STABLE</p>
          </div>

          <div className="flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
            {/* IO Group */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] text-accent-label uppercase tracking-widest opacity-70">Signal Input</span>
              <div className="bg-black border border-accent-dim p-2 text-[10px] flex justify-between items-center transition-colors">
                <span className="text-accent/80 font-mono">USB_VIDEO_DEV_0</span>
                <span className={`flex items-center gap-1 ${isCameraActive ? 'text-red-500' : 'text-accent/20'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full bg-current ${isCameraActive ? 'animate-pulse' : ''}`} />
                  {isCameraActive ? 'LIVE' : 'OFFLINE'}
                </span>
              </div>
            </div>

            {/* Character Set Selection */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] text-accent-label uppercase tracking-widest opacity-70">Glyph Matrix</span>
              <div className="flex flex-wrap gap-1">
                {(Object.keys(CHAR_SETS) as CharSetName[]).map(key => (
                  <button
                    key={key}
                    onClick={() => setCharSet(key)}
                    className={`px-2 py-1 text-[9px] font-bold tracking-wider transition-all border ${
                      charSet === key 
                      ? 'bg-accent-dim text-accent border-accent' 
                      : 'border-accent-dim text-accent/40 hover:text-accent/70 hover:border-accent-dim/80'
                    }`}
                  >
                    {key.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders */}
            <div className="flex flex-col gap-5">
              <ControlSlider label="Density" value={resolution} min={40} max={240} step={10} onChange={setResolution} unit="px" />
              <ControlSlider label="Contrast" value={contrast} min={0.5} max={2} step={0.1} onChange={setContrast} unit="x" />
              <ControlSlider label="Brightness" value={brightness} min={0.5} max={2} step={0.1} onChange={setBrightness} unit="x" />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[10px] text-accent-label uppercase tracking-widest opacity-70">Invert Signal</span>
              <button 
                onClick={() => setIsInverted(!isInverted)}
                className={`w-9 h-4 rounded-full border border-accent-dim relative transition-colors ${isInverted ? 'bg-accent-dim' : 'bg-black'}`}
              >
                <div className={`absolute top-0.5 w-2.5 h-2.5 rounded-full transition-all ${isInverted ? 'left-[22px] bg-accent' : 'left-1 bg-accent/30'}`} />
              </button>
            </div>
          </div>

          {/* Sidebar Footer Stats */}
          <div className="mt-auto border-t border-accent-dim pt-4 flex flex-col gap-2">
             <div className="flex justify-between items-center text-[10px] text-accent/60">
               <span>BUFFER LOAD</span>
               <span className="text-yellow-500 font-mono">|||||||||| 42%</span>
             </div>
             <div className="flex justify-between items-center text-[10px] text-accent/60">
               <span>CPU TEMP</span>
               <span className="text-accent/80">48°C</span>
             </div>
          </div>
        </aside>

        {/* Viewport */}
        <main className="flex-1 relative bg-bg-base overflow-hidden flex items-center justify-center ascii-viewport-grid">
          {/* Hidden Elements for Processing */}
          <video ref={videoRef} autoPlay playsInline className="hidden" />
          <canvas ref={canvasRef} className="hidden" />

          {/* ASCII Output */}
          <div 
            className="select-none pointer-events-none"
            style={{ fontSize: `clamp(4px, ${100 / resolution}vw, 14px)` }}
          >
            <pre className="ascii-art text-accent leading-[0.8] tracking-tighter opacity-90">
              {ascii || 'SEARCHING FOR SIGNAL...'}
            </pre>
          </div>

          {/* Floating UI Overlays */}
          <div className="absolute top-4 right-4 bg-black/80 border border-accent-dim px-3 py-1 text-[10px] flex gap-4 text-accent/70 font-mono backdrop-blur-sm">
            <span>RES: {resolution}x{Math.floor(resolution/1.8)}</span>
            <span>FPS: 60.00</span>
            <span>LATENCY: 4.2ms</span>
          </div>

          <div className="absolute bottom-4 left-4 border-l-2 border-accent pl-4 py-1.5 bg-black/40 backdrop-blur-sm">
            <p className="text-[13px] font-bold tracking-tight text-accent">CAPTURING_USER_SESSION</p>
            <p className="text-[9px] text-accent-label opacity-60 tracking-[0.05em]">ENCODING FRAME {Math.floor(Math.random() * 1000000).toLocaleString('en-US', {minimumIntegerDigits: 7})}...</p>
          </div>

          {error && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
              <div className="bg-red-950/40 border border-red-500/50 p-4 text-red-500 flex flex-col items-center gap-3">
                <Info size={24} />
                <p className="text-[10px] uppercase font-bold tracking-widest">{error}</p>
                <button 
                  onClick={() => startCamera()}
                  className="px-4 py-1 border border-red-500/50 text-[10px] hover:bg-red-500/20"
                >
                  REBOOT INTERFACE
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Footer Status Bar */}
      <footer className="h-[28px] bg-accent-dim flex items-center px-4 py-1 text-[9px] justify-between border-t border-accent tracking-wider font-bold">
        <div className="flex items-center gap-4">
          <span className="text-accent-label">SYSTEM STATUS: <span className="text-white">OPTIMAL</span></span>
          <span className="opacity-30">|</span>
          <span className="text-accent-label/80">STORAGE: 12.4GB FREE</span>
        </div>
        <div className="flex gap-6 text-accent-label/80">
          <span>IP: 192.168.1.44</span>
          <span>UPTIME: 04:12:09</span>
        </div>
      </footer>
    </div>
  );
}

function ControlSlider({ label, value, min, max, step, onChange, unit = "" }: { 
  label: string, 
  value: number, 
  min: number, 
  max: number, 
  step: number,
  onChange: (val: number) => void,
  unit?: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <label className="text-[10px] text-accent-label uppercase tracking-widest opacity-70 font-bold">{label}</label>
        <span className="text-[10px] text-accent font-mono">{value.toFixed(step < 1 ? 1 : 0)}{unit}</span>
      </div>
      <div className="relative group">
        <input 
          type="range" 
          min={min} 
          max={max} 
          step={step} 
          value={value} 
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>
    </div>
  );
}

