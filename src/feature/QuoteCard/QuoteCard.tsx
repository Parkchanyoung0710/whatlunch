'use client';

import { useEffect, useRef, useState } from 'react';
import { QUOTES } from './constants/quotes';
import { getRandomIndex } from './utils';

import styles from './QuoteCard.module.scss';

export default function QuoteCard() {
  const [quote, setQuote] = useState<string | null>(null);
  const lastIndexRef = useRef<number | null>(null);

  useEffect(() => {
    if (QUOTES.length === 0) return;

    let index = getRandomIndex(QUOTES.length);

    if (lastIndexRef.current !== null && QUOTES.length > 1 && index === lastIndexRef.current) {
      index = (index + 1) % QUOTES.length;
    }

    lastIndexRef.current = index;
    setQuote(QUOTES[index]);
  }, []);

  if (!quote) return null;

  const sentences = quote.split('\n');

  return (
    <section className={styles['quote-card']} aria-label="메시지 카드">
      <p className={styles['quote-card__text']}>
        {sentences.map((sentence, idx) => (
          <span key={`${idx}-${sentence}`} className={styles['quote-card__sentence']}>
            {sentence}
          </span>
        ))}
      </p>
    </section>
  );
}
