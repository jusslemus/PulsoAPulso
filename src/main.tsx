import { useCallback, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  ArrowLeft, ArrowRight, Award, Check, Clock3, Heart, Info, RotateCcw,
  Sparkles, Trophy, UserRound, X, Zap,
} from 'lucide-react';
import './styles.css';

type Question = { id: number; afirmacion: string; respuestaCorrecta: boolean; explicacion: string };
type View = 'setup' | 'game' | 'results';
type Player = { name: string; score: number };
type AnswerState = { selected: boolean; correct: boolean; timedOut: boolean };

const PREGUNTAS: Question[] = [
  { id: 1, afirmacion: 'Donar sangre me dejará débil de forma permanente.', respuestaCorrecta: false, explicacion: 'Realidad: El cuerpo repone el líquido perdido en poco tiempo y recupera los glóbulos rojos gradualmente. Algunas personas pueden sentir mareo o cansancio temporal, por eso es importante hidratarse, comer adecuadamente y seguir las indicaciones del personal de salud.' },
  { id: 2, afirmacion: 'Es seguro donar sangre porque se realiza con material estéril y de un solo uso, evitando contraer enfermedades.', respuestaCorrecta: true, explicacion: 'Realidad: La donación se realiza con material estéril y de un solo uso, por lo que no se adquieren infecciones por el procedimiento cuando se siguen las medidas adecuadas.' },
  { id: 3, afirmacion: 'Si tengo tatuajes o piercings, nunca podré donar sangre.', respuestaCorrecta: false, explicacion: 'Realidad: No necesariamente. Dependiendo del país y de las normas del banco de sangre, puede existir solo un período de espera después de hacerse un tatuaje o piercing. Lo correcto es consultar los criterios locales.' },
  { id: 4, afirmacion: 'Las mujeres también pueden donar sangre, siempre que cumplan los requisitos de salud como hemoglobina y peso.', respuestaCorrecta: true, explicacion: 'Realidad: Las mujeres también pueden donar, siempre que cumplan los requisitos de salud. Se evalúan factores como la hemoglobina, el peso y otras condiciones particulares.' },
  { id: 5, afirmacion: 'Donar sangre engorda o hace subir de peso.', respuestaCorrecta: false, explicacion: 'Realidad: No existe evidencia de que la donación de sangre provoque aumento de peso. El peso corporal depende de muchos factores, como la alimentación, la actividad física y el metabolismo.' },
  { id: 6, afirmacion: 'Mi sangre se acaba si dono con frecuencia.', respuestaCorrecta: false, explicacion: 'Realidad: El organismo produce continuamente nuevas células sanguíneas. Sin embargo, es necesario respetar los intervalos entre donaciones para permitir una recuperación adecuada.' },
  { id: 7, afirmacion: 'Solo las personas con un tipo de sangre poco común pueden ayudar al donar.', respuestaCorrecta: false, explicacion: 'Realidad: Todos los grupos sanguíneos son importantes. La sangre compatible es necesaria para distintos pacientes, y la demanda de cada grupo puede variar.' },
  { id: 8, afirmacion: 'Tener una enfermedad o tomar medicamentos no impide donar en todos los casos; el banco de sangre evalúa cada situación.', respuestaCorrecta: true, explicacion: 'Realidad: Depende de la enfermedad, el medicamento y el estado de salud de la persona. Algunas situaciones requieren aplazamiento y otras pueden impedir la donación. La evaluación del banco de sangre determina si es seguro donar.' },
  { id: 9, afirmacion: 'Donar sangre es un procedimiento muy doloroso de principio a fin.', respuestaCorrecta: false, explicacion: 'Realidad: Se siente solo un pinchazo breve al introducir la aguja. La mayoría de las personas tolera bien el procedimiento, aunque la experiencia puede variar.' },
  { id: 10, afirmacion: 'Una sola donación puede procesarse en glóbulos rojos, plaquetas y plasma para beneficiar a distintos pacientes.', respuestaCorrecta: true, explicacion: 'Realidad: Una donación sí hace mucha diferencia, ya que puede procesarse en componentes que benefician a distintos pacientes según las necesidades clínicas.' },
  { id: 11, afirmacion: 'Donar sangre me puede cambiar el tipo de sangre.', respuestaCorrecta: false, explicacion: 'Realidad: Falso. Tu grupo sanguíneo no cambia por donar.' },
  { id: 12, afirmacion: 'Si tengo miedo a las agujas, puedo comunicarlo al personal para recibir orientación y sí puedo donar.', respuestaCorrecta: true, explicacion: 'Realidad: Tener miedo no te excluye automáticamente; puedes comunicarlo al personal de salud para recibir orientación y acompañamiento.' },
  { id: 13, afirmacion: 'La sangre donada se vende para beneficio personal.', respuestaCorrecta: false, explicacion: 'Realidad: No es correcto generalizar. Los servicios de sangre se rigen por normas y procedimientos que varían según el país; la donación voluntaria no significa que todos los procesos relacionados con la transfusión carezcan de costos operativos.' },
  { id: 14, afirmacion: 'Si me siento saludable, no necesito que revisen mi sangre antes de donar.', respuestaCorrecta: false, explicacion: 'Realidad: Falso. Antes de donar siempre se evalúa al donante y la sangre se somete a pruebas para reducir los riesgos para quien la recibe.' },
];

function DropCharacter({ small = false }: { small?: boolean }) {
  return <div className={`drop-character ${small ? 'drop-small' : ''}`} aria-hidden="true"><div className="drop-face"><span></span><span></span><b>⌣</b></div><i className="drop-arm left"></i><i className="drop-arm right"></i><i className="drop-leg left"></i><i className="drop-leg right"></i></div>;
}

function Logo({ compact = false }: { compact?: boolean }) {
  return <div className={`brand ${compact ? 'brand-compact' : ''}`}><div className="logo-drop"><Heart size={compact ? 17 : 24} fill="currentColor" /></div><div><strong>Pulso a Pulso</strong>{!compact && <span>Mitos y Realidades</span>}</div></div>;
}

function SetupView({ onStart }: { onStart: (one: string, two: string, seconds: number) => void }) {
  const [one, setOne] = useState('');
  const [two, setTwo] = useState('');
  const [seconds, setSeconds] = useState(15);
  const [touched, setTouched] = useState(false);
  const canStart = one.trim().length > 0 && two.trim().length > 0;
  return <main className="setup-page">
    <div className="ambient ambient-one"></div><div className="ambient ambient-two"></div>
    <header className="topbar setup-topbar"><Logo /><div className="station-pill"><span>ESTACIÓN 3</span><b>DUEL0 DE SABER</b></div></header>
    <section className="setup-layout">
      <div className="hero-copy">
        <div className="eyebrow"><Sparkles size={15} /> APRENDE. JUEGA. SALVA VIDAS.</div>
        <h1>Tu conocimiento<br /><em>también salva vidas.</em></h1>
        <p>Descubre cuánto sabes sobre la donación de sangre y reta a alguien especial en un duelo de mitos y realidades.</p>
        <div className="hero-fact"><div className="fact-icon"><Heart size={20} fill="currentColor" /></div><div><strong>14 preguntas para poner tu pulso a prueba</strong><span>Dos jugadores · Una misión</span></div></div>
        <div className="hero-illustration"><DropCharacter /><div className="orbit orbit-one"></div><div className="orbit orbit-two"></div><span className="spark spark-a">+</span><span className="spark spark-b">+</span></div>
      </div>
      <div className="setup-card card-shadow">
        <div className="card-topline"><span className="step-number">01</span><span>PREPARA EL DUELO</span></div>
        <h2>¿Quién tiene el<br /><span>mejor pulso?</span></h2>
        <p className="muted">Ingresa los nombres de los participantes para comenzar.</p>
        <div className="field-group"><label htmlFor="player-one"><span className="player-dot coral"></span> JUGADOR 01</label><div className={`input-wrap ${touched && !one.trim() ? 'input-error' : ''}`}><UserRound size={19} /><input id="player-one" value={one} onChange={(event) => setOne(event.target.value)} placeholder="Ej. Valentina" maxLength={22} /></div></div>
        <div className="field-group"><label htmlFor="player-two"><span className="player-dot navy"></span> JUGADOR 02</label><div className={`input-wrap ${touched && !two.trim() ? 'input-error' : ''}`}><UserRound size={19} /><input id="player-two" value={two} onChange={(event) => setTwo(event.target.value)} placeholder="Ej. Mateo" maxLength={22} /></div></div>
        <div className="time-section"><div className="section-label"><span>TIEMPO POR PREGUNTA</span><strong><Clock3 size={15} /> {seconds} segundos</strong></div><div className="time-options">{[10, 15, 20, 30].map((value) => <button type="button" className={seconds === value ? 'selected' : ''} onClick={() => setSeconds(value)} key={value}>{value}s</button>)}</div></div>
        <button className="primary-button start-button" type="button" onClick={() => { setTouched(true); if (canStart) onStart(one.trim(), two.trim(), seconds); }}>Iniciar duelo <ArrowRight size={20} /></button>
        <div className="card-note"><Info size={15} /> Responde cada afirmación antes de que el reloj llegue a cero.</div>
      </div>
    </section>
    <footer className="setup-footer"><span><Heart size={14} fill="currentColor" /> El conocimiento también es una forma de donar.</span><span>ESTACIÓN 3 · PULSO A PULSO</span></footer>
  </main>;
}

function ScoreCard({ player, active, index }: { player: Player; active: boolean; index: number }) {
  return <div className={`score-card ${active ? 'active' : ''} score-${index}`}><div className="score-avatar"><UserRound size={20} /></div><div className="score-details"><span>JUGADOR 0{index}</span><strong>{player.name}</strong></div><div className="score-points"><span>PUNTOS</span><b>{player.score}</b></div>{active && <div className="turn-indicator"><Zap size={11} fill="currentColor" /> TURNO</div>}</div>;
}

function GameView({ players, seconds, onFinish, onBack }: { players: Player[]; seconds: number; onFinish: (nextPlayers: Player[]) => void; onBack: () => void }) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [remaining, setRemaining] = useState(seconds);
  const [answer, setAnswer] = useState<AnswerState | null>(null);
  const [scores, setScores] = useState(players);
  const question = PREGUNTAS[questionIndex];
  const activePlayer = questionIndex % 2;
  const active = scores[activePlayer];
  const answerQuestion = useCallback((selected: boolean, timedOut = false) => {
    if (answer) return;
    const correct = !timedOut && selected === question.respuestaCorrecta;
    setAnswer({ selected: true, correct, timedOut });
    if (correct) setScores((current) => current.map((player, index) => index === activePlayer ? { ...player, score: player.score + 3 } : player));
  }, [activePlayer, answer, question]);
  useEffect(() => { setRemaining(seconds); setAnswer(null); }, [questionIndex, seconds]);
  useEffect(() => { if (answer) return; const timer = window.setInterval(() => setRemaining((current) => { if (current <= 1) { window.clearInterval(timer); answerQuestion(false, true); return 0; } return current - 1; }), 1000); return () => window.clearInterval(timer); }, [answer, answerQuestion]);
  const goNext = () => questionIndex === PREGUNTAS.length - 1 ? onFinish(scores) : setQuestionIndex((current) => current + 1);
  const timerTone = remaining <= 4 ? 'danger' : remaining <= 7 ? 'warning' : 'safe';
  return <main className="game-page"><header className="game-header"><button className="icon-button" onClick={onBack} aria-label="Volver"><ArrowLeft size={20} /></button><Logo compact /><div className="game-header-center"><span>ESTACIÓN 3</span><strong>Pulso a Pulso</strong></div><div className="header-help"><Heart size={16} fill="currentColor" /> Cada respuesta cuenta</div></header>
    <section className="game-content"><div className="scoreboard"><ScoreCard player={scores[0]} index={1} active={activePlayer === 0 && !answer} /><div className="versus">VS</div><ScoreCard player={scores[1]} index={2} active={activePlayer === 1 && !answer} /></div>
      <div className="game-meta"><span className="question-count">PREGUNTA <b>{question.id}</b> <i>DE 14</i></span><div className="progress-track"><div style={{ width: `${(question.id / 14) * 100}%` }}></div></div><div className={`timer ${timerTone} ${remaining <= 4 && !answer ? 'timer-pulse' : ''}`}><Clock3 size={19} /><strong>00:{String(remaining).padStart(2, '0')}</strong></div></div>
      <div className="turn-banner"><span className="turn-line"></span><span>Turno de <strong>{active.name}</strong></span><span className="turn-line"></span></div>
      <section className={`question-card ${answer ? 'answered' : ''}`}><div className="question-tag">MITO <span>O</span> REALIDAD</div><h1>{question.afirmacion}</h1><div className="answer-buttons"><button type="button" className="answer-button true-button" disabled={Boolean(answer)} onClick={() => answerQuestion(true)}><span><Check size={25} strokeWidth={3} /></span> Verdadero</button><button type="button" className="answer-button false-button" disabled={Boolean(answer)} onClick={() => answerQuestion(false)}><span><X size={25} strokeWidth={3} /></span> Falso</button></div></section>
      {answer ? <section className={`feedback-panel ${answer.correct ? 'feedback-correct' : 'feedback-wrong'}`}><div className="feedback-heading"><div className="feedback-icon">{answer.correct ? <Check size={24} /> : answer.timedOut ? <Clock3 size={22} /> : <X size={24} />}</div><div><h2>{answer.timedOut ? 'Tiempo agotado' : answer.correct ? '¡Respuesta correcta!' : 'Respuesta incorrecta'}</h2><span>{answer.correct ? '+3 puntos para ' : '0 puntos · '}{active.name}</span></div></div><p><strong>Realidad:</strong> {question.explicacion.replace('Realidad: ', '')}</p><button className="primary-button next-button" onClick={goNext}>{questionIndex === PREGUNTAS.length - 1 ? 'Ver resultados finales' : 'Siguiente turno'} <ArrowRight size={18} /></button></section> : <p className="game-hint"><Heart size={14} fill="currentColor" /> Piensa bien, cada respuesta es una oportunidad para aprender.</p>}
    </section><footer className="game-footer"><span><Award size={16} /> 3 puntos por respuesta correcta</span><span>{question.id} / 14</span></footer></main>;
}

function ResultsView({ players, onRematch, onReset }: { players: Player[]; onRematch: () => void; onReset: () => void }) {
  const tie = players[0].score === players[1].score;
  const winner = tie ? null : players[0].score > players[1].score ? players[0] : players[1];
  const loser = tie ? null : players[0].score > players[1].score ? players[1] : players[0];
  useEffect(() => { void confetti({ particleCount: 150, spread: 90, origin: { y: 0.55 }, colors: ['#fbbf24', '#ee3445', '#ffffff', '#1e8791'] }); }, []);
  return <main className="results-page"><div className="result-glow"></div><header className="results-header"><Logo /><span className="completed-pill"><Check size={14} /> DUELO COMPLETADO</span></header><section className="results-content"><div className="results-title"><span className="eyebrow"><Sparkles size={15} /> RESULTADO FINAL</span><h1>{tie ? '¡Empate de titanes!' : '¡Tenemos un ganador!'}</h1><p>{tie ? 'Ambos demostraron tener un pulso extraordinario.' : 'El conocimiento y la rapidez hicieron la diferencia.'}</p></div>{tie ? <div className="tie-layout">{players.map((player, index) => <ResultCard key={player.name} player={player} isWinner index={index} />)}<div className="tie-badge"><Zap size={22} fill="currentColor" /> VS <Zap size={22} fill="currentColor" /></div></div> : <div className="winner-layout"><ResultCard player={winner!} isWinner index={players.indexOf(winner!)} /><div className="versus-result"><span>VS</span><div className="result-line"></div><Heart size={23} fill="currentColor" /></div><ResultCard player={loser!} isWinner={false} index={players.indexOf(loser!)} /></div>}<div className="result-actions"><button className="primary-button" onClick={onRematch}><RotateCcw size={18} /> Jugar revancha</button><button className="secondary-button" onClick={onReset}>Cambiar jugadores / inicio</button></div></section><footer className="results-footer"><Heart size={14} fill="currentColor" /> Gracias por aprender algo que puede salvar vidas</footer></main>;
}

function ResultCard({ player, isWinner, index }: { player: Player; isWinner: boolean; index: number }) {
  return <article className={`result-card ${isWinner ? 'winner-card' : 'loser-card'}`}><div className="result-card-top"><span className="result-label">{isWinner ? <><Trophy size={16} /> GANADOR</> : <><Heart size={16} /> DERROTADO</>}</span><span>JUGADOR 0{index + 1}</span></div><div className={`result-medal ${isWinner ? '' : 'sad-medal'}`}>{isWinner ? <Trophy size={52} /> : <Heart size={45} />}</div><h2>{player.name}</h2><div className="final-score"><strong>{player.score}</strong><span>puntos</span></div>{isWinner && <div className="winner-shine"><Sparkles size={14} /> ¡Pulso imparable!</div>}</article>;
}

function App() {
  const [view, setView] = useState<View>('setup');
  const [players, setPlayers] = useState<Player[]>([{ name: '', score: 0 }, { name: '', score: 0 }]);
  const [seconds, setSeconds] = useState(15);
  const startGame = (one: string, two: string, time: number) => { setPlayers([{ name: one, score: 0 }, { name: two, score: 0 }]); setSeconds(time); setView('game'); };
  return view === 'setup' ? <SetupView onStart={startGame} /> : view === 'game' ? <GameView players={players} seconds={seconds} onFinish={(finalPlayers) => { setPlayers(finalPlayers); setView('results'); }} onBack={() => setView('setup')} /> : <ResultsView players={players} onRematch={() => { setPlayers(players.map((player) => ({ ...player, score: 0 }))); setView('game'); }} onReset={() => setView('setup')} />;
}

export default App;
