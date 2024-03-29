import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
  Fragment,
} from 'react';
import './App.css';
import useInterval from './hooks/useInterval';

const tickMs = 25;
const loadingMultiplier = 60;
const loadingDots = 4;
const ipURL = 'https://geolocation-db.com/json/';

const preTemplate = `
Last login: {{user-data}}

~  Online home of Joakim Kronqvist
~  Full-stack developer
~  Working as a principal mobile developer at Starship Technologies
~  Co-founder of DayStable

     [Open my LinkedIn ->](https://www.linkedin.com/in/jkro/)

     [Open my Github ->](https://github.com/kronken)

~  Hobby photographer

    [Open my Instagram ->](https://www.instagram.com/bumblebeetushie)
`;

interface Cache {
  [line: number]: {
    title: string;
    href: string;
  };
}

const App = () => {
  const [loadingText, setLoadingText] = useState('');
  const [text, setText] = useState('');
  const [template, setTemplate] = useState('');
  const [pointer, setPointer] = useState(0);
  const [hasLoaded, setHasLoaded] = useState(false);
  const cache = useRef<Cache>({});

  const tickCounterRef = useRef<number>(0);

  const tickLoading = useCallback(() => {
    const mod = tickCounterRef.current % loadingMultiplier;
    const nextCount = Math.floor((mod / loadingMultiplier) * loadingDots);
    setLoadingText(
      Array(nextCount)
        .fill(0)
        .map(() => '.')
        .join(''),
    );
  }, []);

  const renderLink = useCallback(
    (key: number, href: string, text: string) => (
      <Fragment key={key}>
        <a href={href}>{text}</a>
        <br />
        <br />
      </Fragment>
    ),
    [],
  );

  const renderText = useMemo(() => {
    return text.split(/\r?\n/).map((line, index) => {
      if (line) {
        const lineCache = cache.current[index];
        if (lineCache) {
          return renderLink(index, lineCache.href, lineCache.title);
        } else if (line.includes('[')) {
          var titleRegex = /\[(.*?)\]/;
          var titleArray = titleRegex.exec(line);
          const title = titleArray
            ? titleArray[0].replace('[', '').replace(']', '')
            : null;

          var hrefRegex = /\((.*?)\)/;
          var hrefArray = hrefRegex.exec(preTemplate.split(/\r?\n/)[index]);
          const href = hrefArray
            ? hrefArray[0].replace('(', '').replace(')', '')
            : null;

          if (title && href) {
            cache.current[index] = {
              href,
              title,
            };
            return renderLink(index, href, title);
          }
          const tmpTitle = line.trim().split(']')[0].replace('[', '');
          return renderLink(index, href || '', tmpTitle);
        } else {
          return <p key={index}>{line}</p>;
        }
      }
      return null;
    });
  }, [renderLink, text]);

  const tickText = useCallback(() => {
    if (pointer !== template.length) {
      const char = template[pointer];
      let insertChar = char;
      setText(text + insertChar);
      setPointer(pointer + 1);
    }
  }, [pointer, template, text]);

  useInterval(() => {
    if (!hasLoaded) {
      tickLoading();
    } else {
      tickText();
    }
    tickCounterRef.current = tickCounterRef.current + 1;
  }, tickMs);

  const fetchData = useCallback(async () => {
    const data = await fetch(ipURL);
    const {country_name, IPv4, city} = await data.json();

    const dateString = new Date().toLocaleString();

    const text = `${dateString} from ${city}, ${country_name} at ${IPv4}`;
    const t = preTemplate.replace('{{user-data}}', text);
    setTemplate(t);
    setHasLoaded(true);
  }, []);

  const init = useCallback(() => {
    document.title = 'Joakim Kronqvist';

    setTimeout(() => {
      fetchData();
    }, 2000);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <div className="App">
      <span style={{whiteSpace: 'pre-wrap'}}>
        {hasLoaded ? renderText : loadingText}
      </span>
    </div>
  );
};

export default App;
