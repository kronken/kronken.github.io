import {useCallback, useEffect, useRef, useState} from 'react';
import './App.css';

const tickMs = 25;
const tickLoadingMs = 500;
const maxLoadingCount = 4;
const ipURL = 'https://geolocation-db.com/json/';

const preTemplate = `
Last login: {{user-data}}

~  Online home of Joakim Kronqvist
~  Full-stack developer
~  Working as a senior mobile developer at Starship Technologies
~  Co-founder of DayStable

     [Open LinkedIn ->](https://google.com)

     [Open Github ->](https://google.com)

~  Hobby photographer

    [Open my Instagram ->](https://google.com)
`;

const App = () => {
  const [text, setText] = useState('');
  const [template, setTemplate] = useState('');
  const [pointer, setPointer] = useState(0);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loadingCount, setLoadingCount] = useState(0);
  const savedCallback = useRef<() => void>();
  const savedLoadingCallback = useRef<() => void>();
  const timer = useRef<NodeJS.Timer | undefined>();
  const loadingTimer = useRef<NodeJS.Timer | undefined>();

  const writeNextChar = useCallback(() => {
    if (pointer !== template.length) {
      const char = template[pointer];
      let insertChar = char;
      setText(text + insertChar);
      setPointer(pointer + 1);
    } else {
      clearInterval(timer.current);
    }
  }, [pointer, template, text]);

  useEffect(() => {
    savedCallback.current = writeNextChar;
  }, [writeNextChar]);

  const startConsole = useCallback(() => {
    const tick = () => {
      if (savedCallback.current) {
        savedCallback.current();
      }
    };
    timer.current = setInterval(tick, tickMs);
    return () => clearInterval(timer.current);
  }, []);

  const writeNextLoadingState = useCallback(() => {
    if (!hasLoaded) {
      const nextCount = (loadingCount + 1) % maxLoadingCount;
      setText(
        Array(nextCount)
          .fill(0)
          .map(() => '.')
          .join(''),
      );
      setLoadingCount(nextCount);
    }
  }, [hasLoaded, loadingCount]);

  useEffect(() => {
    savedLoadingCallback.current = writeNextLoadingState;
  }, [writeNextLoadingState]);

  const startLoading = useCallback(() => {
    const tick = () => {
      if (savedLoadingCallback.current) {
        savedLoadingCallback.current();
      }
    };
    loadingTimer.current = setInterval(tick, tickLoadingMs);
    return () => clearInterval(loadingTimer.current);
  }, []);

  const fetchData = useCallback(async () => {
    const data = await fetch(ipURL);
    const {country_name, IPv4, city} = await data.json();

    const dateString = new Date().toLocaleString();

    const text = `${dateString} from ${city}, ${country_name} at ${IPv4}`;
    const t = preTemplate.replace('{{user-data}}', text);
    setTemplate(t);
    setHasLoaded(true);
    clearInterval(loadingTimer.current);
    setText('');
    startConsole();
  }, [startConsole]);

  useEffect(() => {
    startLoading();
    setTimeout(() => {
      fetchData();
    }, 2000);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="App">
      <span style={{whiteSpace: 'pre-wrap'}}>{text}</span>
    </div>
  );
};

export default App;
