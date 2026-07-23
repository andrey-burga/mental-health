import React, { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import Section from "../components/Section";
import Footer from "../components/Footer";
import PageTransition from "../components/PageTransition";

interface Track {
  id: string;
  title: string;
  category: "Naturaleza" | "Enfoque" | "Relax";
  icon: string;
  description: string;
  type: "white" | "pink" | "brown" | "sine"; // Tipos de ruido generables nativamente
  freq?: number;
}

const TRACKS: Track[] = [
  { id: "rain", title: "Lluvia Fina", category: "Naturaleza", icon: "🌧️", description: "Ruido rosa suave simulando gotas de agua.", type: "pink" },
  { id: "waves", title: "Océano de Fondo", category: "Naturaleza", icon: "🌊", description: "Ruido marrón profundo con frecuencias bajas.", type: "brown" },
  { id: "white", title: "Ruido Blanco Puro", category: "Relax", icon: "📻", description: "Aísla distracciones del entorno.", type: "white" },
  { id: "alpha", title: "Onda Alfa (10 Hz Focus)", category: "Enfoque", icon: "🧠", description: "Tono isocrónico para estimular la concentración.", type: "sine", freq: 210 },
];

export default function SonidosPage() {
  const [activeTracks, setActiveTracks] = useState<{ [key: string]: number }>({});
  const [timerMinutes, setTimerMinutes] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  // Referencias para la API de Audio de Web Browser
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{ [key: string]: { gain: GainNode; stop: () => void } }>({});

  // Inicializar contexto de audio al interactuar
  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
  };

  // Generador sintético de audio ambiental
  const startSound = (track: Track) => {
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.connect(ctx.destination);

    let stopFunc = () => {};

    if (track.type === "sine") {
      // Tono para enfoque
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(track.freq || 200, ctx.currentTime);
      osc.connect(gainNode);
      osc.start();
      stopFunc = () => osc.stop();
    } else {
      // Generador de Ruido (Blanco, Rosa, Marrón)
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (track.type === "white") {
          data[i] = white * 0.1;
        } else if (track.type === "pink") {
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
          b6 = white * 0.115926;
        } else if (track.type === "brown") {
          data[i] = (b0 = (b0 + (0.02 * white)) / 1.02) * 0.2;
        }
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      noise.connect(gainNode);
      noise.start();
      stopFunc = () => noise.stop();
    }

    nodesRef.current[track.id] = { gain: gainNode, stop: stopFunc };
  };

  const stopSound = (trackId: string) => {
    if (nodesRef.current[trackId]) {
      nodesRef.current[trackId].stop();
      delete nodesRef.current[trackId];
    }
  };

  // Alternar o ajustar volumen
  const handleVolumeChange = (track: Track, volume: number) => {
    setActiveTracks((prev) => {
      const updated = { ...prev };
      if (volume === 0) {
        delete updated[track.id];
        stopSound(track.id);
      } else {
        if (!updated[track.id]) {
          startSound(track);
        }
        updated[track.id] = volume;
        if (nodesRef.current[track.id]) {
          nodesRef.current[track.id].gain.gain.setValueAtTime(volume / 100, audioCtxRef.current?.currentTime || 0);
        }
      }
      return updated;
    });
  };

  const toggleTrack = (track: Track) => {
    const isPlaying = !!activeTracks[track.id];
    handleVolumeChange(track, isPlaying ? 0 : 50);
  };

  const stopAll = () => {
    Object.keys(nodesRef.current).forEach((id) => stopSound(id));
    setActiveTracks({});
    setTimerMinutes(null);
    setTimeRemaining(null);
  };

  // Lógica del Temporizador de Apagado
  useEffect(() => {
    if (!timerMinutes) return;
    setTimeRemaining(timerMinutes * 60);

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          stopAll();
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerMinutes]);

  const activeCount = Object.keys(activeTracks).length;

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-violet-50/30 dark:from-slate-950 dark:to-slate-900 text-slate-800 dark:text-gray-100 transition-colors duration-300">
        <Header />

        <main className="flex-grow">
          <Section>
            <div className="max-w-3xl mx-auto space-y-8">
              
              {/* Encabezado */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 bg-violet-500/10 px-3 py-1 rounded-full">
                    Atmósfera Sonora
                  </span>
                  <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                    Mezclador de Paisajes Auditivos 🎧
                  </h1>
                  <p className="mt-2 text-slate-600 dark:text-slate-400 text-sm">
                    Crea tu propia mezcla relajante combinando diferentes frecuencias y sonidos ambientales.
                  </p>
                </div>

                {activeCount > 0 && (
                  <button
                    onClick={stopAll}
                    className="self-start sm:self-center px-4 py-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-500 hover:text-white transition-colors"
                  >
                    Detener Todo ({activeCount})
                  </button>
                )}
              </div>

              {/* Panel del Temporizador */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">⏱️</span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Temporizador de Sueño</h4>
                    <p className="text-[11px] text-slate-400">
                      {timeRemaining !== null
                        ? `Apagado automático en: ${Math.floor(timeRemaining / 60)}m ${timeRemaining % 60}s`
                        : "Detiene los sonidos automáticamente"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 text-xs">
                  {[15, 30, 45].map((m) => (
                    <button
                      key={m}
                      onClick={() => setTimerMinutes(timerMinutes === m ? null : m)}
                      className={`px-3 py-1.5 rounded-lg border transition-all ${
                        timerMinutes === m
                          ? "bg-violet-600 text-white border-violet-600 font-semibold"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {m} min
                    </button>
                  ))}
                </div>
              </div>

              {/* Lista de Sonidos (Grid) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {TRACKS.map((track) => {
                  const isPlaying = !!activeTracks[track.id];
                  const volume = activeTracks[track.id] || 0;

                  return (
                    <div
                      key={track.id}
                      className={`p-5 rounded-2xl border transition-all space-y-4 ${
                        isPlaying
                          ? "bg-white dark:bg-slate-900 border-violet-500 shadow-md ring-1 ring-violet-500/30"
                          : "bg-white/60 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                            {track.icon}
                          </span>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                              {track.title}
                            </h4>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-violet-500/10 text-violet-600 dark:text-violet-400 font-medium">
                              {track.category}
                            </span>
                          </div>
                        </div>

                        {/* Botón Play / Pause */}
                        <button
                          onClick={() => toggleTrack(track)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                            isPlaying
                              ? "bg-violet-600 text-white shadow-sm"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                          }`}
                        >
                          {isPlaying ? "Pausar" : "Activar"}
                        </button>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {track.description}
                      </p>

                      {/* Control Deslizante de Volumen */}
                      {isPlaying && (
                        <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                            <span>Volumen</span>
                            <span>{volume}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={volume}
                            onChange={(e) => handleVolumeChange(track, Number(e.target.value))}
                            className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-600"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>
          </Section>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}