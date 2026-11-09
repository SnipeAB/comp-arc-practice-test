import { useState } from 'react';
import { originalTest, freshTest } from './questions.js';

const MODES = {
  original: { label: 'Original 20', make: originalTest },
  fresh: { label: 'New numbers', make: freshTest },
};

function Question({ q, n, pick, done, onPick }) {
  const right = pick === q.answer;
  return (
    <li className="question">
      <fieldset disabled={done}>
        <legend>
          <span className="num">{n}.</span> {q.q}
        </legend>
        {q.options.map((option, i) => (
          <label
            key={option}
            className={done && i === q.answer ? 'option good' : done && i === pick ? 'option bad' : 'option'}
          >
            <input type="radio" name={`q${n}`} checked={pick === i} onChange={() => onPick(i)} />
            <span className="value">{option}</span>
            {done && i === q.answer && <span className="tag">✓ Correct answer</span>}
            {done && i === pick && !right && <span className="tag">✗ Your answer</span>}
          </label>
        ))}
      </fieldset>
      {done && pick === undefined && <p className="skipped">Not answered</p>}
      {done && (
        <details open={!right}>
          <summary>Worked solution</summary>
          <pre>{q.why}</pre>
        </details>
      )}
    </li>
  );
}

export default function App() {
  const [mode, setMode] = useState('original');
  const [test, setTest] = useState(originalTest);
  const [picks, setPicks] = useState({});
  const [done, setDone] = useState(false);

  const answered = Object.keys(picks).length;
  const score = test.filter((q, i) => picks[i] === q.answer).length;

  function start(next) {
    if (!done && answered && !confirm('Start over and lose your current answers?')) return;
    setMode(next);
    setTest(MODES[next].make());
    setPicks({});
    setDone(false);
    window.scrollTo(0, 0);
  }

  function submit() {
    setDone(true);
    window.scrollTo(0, 0);
  }

  return (
    <main>
      <header>
        <p className="eyebrow">Outcome 1 practice test</p>
        <h1>Computer Architecture</h1>
        <div className="modes" role="group" aria-label="Question set">
          {Object.entries(MODES).map(([key, { label }]) => (
            <button key={key} aria-pressed={mode === key} onClick={() => start(key)}>
              {label}
            </button>
          ))}
        </div>
      </header>

      {done && (
        <section className="result" role="status">
          <div>
            <strong>
              {score} / {test.length}
            </strong>
            <span>{Math.round((score / test.length) * 100)}%</span>
          </div>
          <button className="primary" onClick={() => start(mode)}>
            Try again
          </button>
        </section>
      )}

      <ol className="paper">
        {test.map((q, i) => (
          <Question
            key={i}
            q={q}
            n={i + 1}
            pick={picks[i]}
            done={done}
            onPick={(choice) => setPicks({ ...picks, [i]: choice })}
          />
        ))}
      </ol>

      {!done && (
        <footer className="submit-bar">
          <span>
            {answered} of {test.length} answered
          </span>
          <button className="primary" onClick={submit}>
            Submit
          </button>
        </footer>
      )}
    </main>
  );
}
