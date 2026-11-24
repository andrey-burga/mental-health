import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageTransition from "../components/PageTransition";
import { trackToolEvent } from "../utils/telemetry";

interface Track {
  id: string;
  title: string;
  category: "Naturaleza" | "Enfoque" | "Relax";
  iconPath: string;
  description: string;
  type: "white" | "pink" | "brown" | "sine";
  freq?: number;
}

const TRACKS: Track[] = [
  {
    id: "rain",
    title: "Lluvia Fina",
    category: "Naturaleza",
    iconPath:
      "M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z",
    description: "Ruido rosa suave que evoca gotas constantes de agua.",
    type: "pink",
  },
  {
    id: "waves",
    title: "Océano de Fondo",
    category: "Naturaleza",
    iconPath:
      "M3.75 9.75c2.25-1.5 4.5-1.5 6.75 0s4.5 1.5 6.75 0 3.75-1.5 3.75-1.5M3.75 15c2.25-1.5 4.5-1.5 6.75 0s4.5 1.5 6.75 0 3.75-1.5 3.75-1.5",
    description: "Ruido marrón profundo con frecuencias cálidas y graves.",
    type: "brown",
  },
  {
    id: "white",
    title: "Ruido Blanco Puro",
    category: "Relax",
    iconPath:
      "M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z",
    description: "Atenúa ruidos repentinos y distracciones del entorno.",
    type: "white",
  },
  {
    id: "alpha",
    title: "Onda Alfa (Enfoque Suave)",
    category: "Enfoque",
    iconPath:
      "M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z",
    description: "Tono armónico continuo para acompañar estudio o lectura.",
    type: "sine",
    freq: 210,
  },
];

export default function SonidosPage() {
  const [activeTracks, setActiveTracks] = useState<{ [key: string]: number }>({});
  const [timerMinutes, setTimerMinutes] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{ [key: string]: { gain: GainNode; stop: () => void } }>({});

  useEffect(() => {
    trackToolEvent("sonidos");
  }, []);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
  };

  const startSound = (track: Track) => {
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.connect(ctx.destination);

    let stopFunc = () => {};

    if (track.type === "sine") {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(track.freq || 200, ctx.currentTime);
      osc.connect(gainNode);
      osc.start();
      stopFunc = () => osc.stop();
    } else {
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0,
        b1 = 0,
        b2 = 0,
        b3 = 0,
        b4 = 0,
        b5 = 0,
        b6 = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (track.type === "white") {
          data[i] = white * 0.1;
        } else if (track.type === "pink") {
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.969 * b2 + white * 0.153852;
          b3 = 0.8665 * b3 + white * 0.3104856;
          b4 = 0.55 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.016898;
          data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
          b6 = white * 0.115926;
        } else if (track.type === "brown") {
          data[i] = (b0 = (b0 + 0.02 * white) / 1.02) * 0.2;
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
          nodesRef.current[track.id].gain.gain.setValueAtTime(
            volume / 100,
            audioCtxRef.current?.currentTime || 0
          );
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

  useEffect(() => {
    const nodes = nodesRef.current;
    return () => {
      Object.keys(nodes).forEach((id) => {
        try {
          nodes[id]?.stop();
        } catch {
          // Ignorar si el nodo ya fue detenido
        }
        delete nodes[id];
      });
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const activeCount = Object.keys(activeTracks).length;

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-300 relative overflow-x-clip">
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-x-0 top-16 -z-0 flex justify-between overflow-hidden"
        >
          <div className="h-72 w-72 -translate-x-1/3 rounded-full bg-indigo-400/10 blur-3xl dark:bg-indigo-500/5" />
          <div className="h-72 w-72 translate-x-1/3 rounded-full bg-teal-400/10 blur-3xl dark:bg-teal-500/5" />
        </div>

        <Header />

        <main className="flex-grow relative z-10">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-8">
            {/* Encabezado */}
            <div className="border-b border-neutral-200/80 dark:border-neutral-800 pb-6 space-y-2">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Atmósfera sonora
                </p>
                <Link
                  to="/dashboard"
                  className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
                >
                  ← Volver a Mi Espacio
                </Link>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                    Paisajes Sonoros
                  </h1>
                  <p className="mt-2 text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    Crea tu propia mezcla relajante combinando sonidos ambientales y frecuencias suaves.
                  </p>
                </div>

                {activeCount > 0 && (
                  <button
                    type="button"
                    onClick={stopAll}
                    className="self-start sm:self-end px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/70 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-xs font-semibold hover:bg-rose-100 dark:hover:bg-rose-950/60 transition-colors cursor-pointer tabular-nums shrink-0"
                  >
                    Detener todo ({activeCount})
                  </button>
                )}
              </div>
            </div>

            {/* Panel del Temporizador */}
            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900/70 border border-neutral-200/80 dark:border-neutral-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.8"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
                    Temporizador de sueño
                  </h2>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 tabular-nums">
                    {timeRemaining !== null
                      ? `Apagado automático en ${Math.floor(timeRemaining / 60)}m ${timeRemaining % 60}s`
                      : "Detiene los sonidos automáticamente"}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 text-xs">
                {[15, 30, 45].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setTimerMinutes(timerMinutes === m ? null : m)}
                    className={`px-3.5 py-1.5 rounded-lg border transition-colors cursor-pointer tabular-nums ${
                      timerMinutes === m
                        ? "bg-indigo-600 text-white border-indigo-600 font-semibold"
                        : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-600 dark:text-neutral-300"
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
                        ? "bg-white dark:bg-neutral-900 border-indigo-500 shadow-sm ring-1 ring-indigo-500/25"
                        : "bg-white dark:bg-neutral-900/70 border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                            isPlaying
                              ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
                              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                          }`}
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.8"
                            stroke="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d={track.iconPath}
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                            {track.title}
                          </h3>
                          <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                            {track.category}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleTrack(track)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                          isPlaying
                            ? "bg-indigo-600 text-white shadow-xs"
                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                        }`}
                      >
                        {isPlaying ? "Pausar" : "Activar"}
                      </button>
                    </div>

                    <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      {track.description}
                    </p>

                    {isPlaying && (
                      <div className="space-y-1.5 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                        <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400 font-medium tabular-nums">
                          <span>Volumen</span>
                          <span>{volume}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          aria-label={`Volumen de ${track.title}`}
                          value={volume}
                          onChange={(e) => handleVolumeChange(track, Number(e.target.value))}
                          className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}