'use client';

import Image from 'next/image';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowUpRight, MessageCircle, RotateCcw, Send, X } from 'lucide-react';
import { filterQuery, parseFilters } from '@/lib/domain/filters';

type Message = { role: 'assistant' | 'user'; text: string; link?: { label: string; href: string } };
const greeting: Message = {
  role: 'assistant',
  text: 'Saya AIDA, pembantu digital Dasar Dadah Negara. Apa yang anda mahu terokai hari ini?',
};
const initialChoices = ['Mulakan lawatan', 'Terangkan peta', 'Sumber data'];

export function MockAssistant() {
  const params = useSearchParams();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([greeting]);
  const [choices, setChoices] = useState(initialChoices);
  const [input, setInput] = useState('');
  const launcher = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const conversation = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const frame = document.querySelector<HTMLElement>('.app-frame');
    const previousInert = frame?.inert ?? false;
    const previousOverflow = document.body.style.overflow;
    const returnFocus = launcher.current;
    if (frame) frame.inert = true;
    document.body.style.overflow = 'hidden';
    closeButton.current?.focus();
    return () => {
      if (frame) frame.inert = previousInert;
      document.body.style.overflow = previousOverflow;
      returnFocus?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (open && conversation.current)
      conversation.current.scrollTop = conversation.current.scrollHeight;
  }, [messages, open]);

  function reset() {
    setMessages([greeting]);
    setChoices(initialChoices);
    setInput('');
  }

  function ask(question: string) {
    const text = question.trim().slice(0, 500);
    if (!text) return;
    const query = filterQuery(parseFilters(Object.fromEntries(params.entries())));
    const scenario = `/?${query}`;
    const topic = text.toLocaleLowerCase('ms');
    let reply: Message;
    let nextChoices: string[];
    if (/disekat|suppres|privasi|peribadi/.test(topic)) {
      reply = {
        role: 'assistant',
        text: 'Disekat bermaksud nilai dilindungi oleh kawalan pendedahan. Ia tidak bermaksud sifar. Kadar, pemacu dan perbandingan berkaitan turut disekat. AIDA ialah panduan demo; maklumat peribadi tidak diperlukan.',
        link: { label: 'Semak kaedah peta', href: `${scenario}#peta-strategik` },
      };
      nextChoices = ['Terangkan peta', 'Sumber data'];
    } else if (/tindakan/.test(topic)) {
      reply = {
        role: 'assistant',
        text: 'Pilih negeri dan lapisan pada peta, kemudian gunakan Cipta tindakan bersama untuk membawa konteks tersebut ke ruang tindakan. Catat pemilik, tarikh akhir dan bukti susulan; kebenaran anda tetap terpakai.',
        link: { label: 'Buka tindakan bersama', href: `/actions?${query}` },
      };
      nextChoices = ['Terangkan peta', 'Empat teras'];
    } else if (/peta|map|warna|kadar/.test(topic)) {
      reply = {
        role: 'assistant',
        text: 'Pilih lapisan dan negeri. Hijau, kuning dan merah menunjukkan kadar relatif dalam paparan: julat kadar positif dibahagi tiga. Kaedah ini tersedia untuk senario senario rekaan dan kadar beban sumber dibekalkan 2024–2025. Buka legenda untuk had dan versi kaedah. Ini bukan tahap ancaman rasmi. Keyakinan kekal pada skala biru; mod bilangan menggunakan saiz simbol.',
        link: { label: 'Terokai peta strategik', href: `${scenario}#peta-strategik` },
      };
      nextChoices = ['Apa maksud disekat?', 'Cipta tindakan'];
    } else if (/sumber|data|laporan/.test(topic)) {
      reply = {
        role: 'assistant',
        text: 'Scenario Semasa memisahkan petikan sumber dibekalkan daripada senario senario rekaan. Pilih tempoh untuk laporan mingguan atau Buku Maklumat Dadah 2025. Buka Tentang angka ini, pemacu peta atau katalog untuk sumber, takrif dan batasan. Angka pentadbiran bukan ukuran prevalens atau bukti impak program.',
        link: { label: 'Lihat katalog data', href: '/data/catalog' },
      };
      nextChoices = ['Terangkan peta', 'Empat teras'];
    } else if (/teras/.test(topic)) {
      reply = {
        role: 'assistant',
        text: 'Empat Teras DDN 2.0 ialah Pencegahan Pintar & Generasi Celik; Pemulihan Tingkah Laku & Kesihatan Awam; Penguatkuasaan Proaktif dan Ramalan Risiko; Kerjasama Antarabangsa & Tadbir Urus Inklusif. Rawatan dan pengurangan kemudaratan kekal sebagai dua domain dalam Teras 2. Setiap halaman memaparkan bukti yang tersedia dan batasan senario. Mulakan dengan Teras yang sepadan dengan persoalan anda.',
        link: { label: 'Teroka empat teras', href: `${scenario}#overview-teras-heading` },
      };
      nextChoices = ['Sumber data', 'Cipta tindakan'];
    } else if (/lawatan|mula|scenario|gambaran/.test(topic)) {
      reply = {
        role: 'assistant',
        text: 'Mari mulakan dengan Scenario Semasa untuk melihat ringkasan bersumber. Seterusnya, terokai peta dan pilih Teras yang berkaitan. Anda mahu melihat Scenario Semasa atau mengenali empat Teras dahulu?',
        link: { label: 'Lihat Scenario Semasa', href: scenario },
      };
      nextChoices = ['Empat teras', 'Terangkan peta'];
    } else {
      reply = {
        role: 'assistant',
        text: 'Saya menyediakan panduan demo tentang dashboard ini. Pilih lawatan, peta, sumber data atau tindakan bersama. Jawapan ini ialah panduan yang disediakan terlebih dahulu; AIDA tidak menganalisis data atau menjawab soalan bebas dengan AI.',
      };
      nextChoices = initialChoices;
    }
    setMessages((current) => [...current, { role: 'user', text } as Message, reply].slice(-31));
    setChoices(nextChoices);
    setInput('');
  }

  function handleKeys(event: KeyboardEvent<HTMLElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      return;
    }
    if (event.key !== 'Tab') return;
    const items = panel.current?.querySelectorAll<HTMLElement>(
      'button:not(:disabled), a[href], input:not(:disabled)',
    );
    if (!items?.length) return;
    const first = items[0],
      last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <>
      <button
        ref={launcher}
        className="assistant-launcher"
        aria-label="Buka AIDA, pembantu digital Dasar Dadah Negara"
        aria-expanded={open}
        aria-controls="ddn-assistant"
        aria-hidden={open || undefined}
        tabIndex={open ? -1 : 0}
        onClick={() => setOpen(true)}
      >
        <Image src="/aida-avatar.svg" alt="" width={48} height={48} />
        <span>
          <strong>AIDA</strong>
          <small>
            Mahu panduan? <MessageCircle size={12} />
          </small>
        </span>
      </button>
      {open &&
        createPortal(
          <>
            <div className="assistant-backdrop" aria-hidden="true" onClick={() => setOpen(false)} />
            <section
              ref={panel}
              id="ddn-assistant"
              className="assistant-panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby="assistant-title"
              onKeyDown={handleKeys}
            >
              <header className="assistant-header">
                <Image src="/aida-avatar.svg" alt="Watak AIDA" width={58} height={58} />
                <div>
                  <h2 id="assistant-title">AIDA</h2>
                  <p>Asisten Inteligen Dasar Antidadah</p>
                </div>
                <button
                  className="icon-button"
                  aria-label="Mulakan perbualan semula"
                  onClick={reset}
                >
                  <RotateCcw size={17} />
                </button>
                <button
                  ref={closeButton}
                  className="icon-button"
                  aria-label="Tutup pembantu"
                  onClick={() => setOpen(false)}
                >
                  <X size={20} />
                </button>
              </header>
              <div
                ref={conversation}
                className="assistant-conversation"
                role="log"
                aria-label="Perbualan AIDA"
                aria-live="polite"
                aria-relevant="additions text"
              >
                {messages.map((message, index) => (
                  <div key={index} className={`assistant-message ${message.role}`}>
                    <small>{message.role === 'user' ? 'ANDA' : 'AIDA'}</small>
                    <p>{message.text}</p>
                    {message.link && (
                      <Link href={message.link.href} onClick={() => setOpen(false)}>
                        {message.link.label}
                        <ArrowUpRight size={13} />
                      </Link>
                    )}
                  </div>
                ))}
              </div>
              <div className="assistant-choices" aria-label="Cadangan soalan">
                {choices.map((choice) => (
                  <button key={choice} onClick={() => ask(choice)}>
                    {choice}
                    <ArrowUpRight size={13} />
                  </button>
                ))}
              </div>
              <form
                className="assistant-compose"
                onSubmit={(event) => {
                  event.preventDefault();
                  ask(input);
                }}
              >
                <label className="sr-only" htmlFor="assistant-input">
                  Soalan anda
                </label>
                <input
                  id="assistant-input"
                  maxLength={500}
                  placeholder="Tanya tentang dashboard…"
                  autoComplete="off"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                />
                <button
                  type="submit"
                  aria-label="Hantar soalan"
                  aria-disabled={!input.trim()}
                  disabled={!input.trim()}
                >
                  <Send size={18} />
                </button>
              </form>
              <p className="assistant-privacy">
                Mesej hanya dalam sesi ini. Elakkan maklumat peribadi.
              </p>
            </section>
          </>,
          document.body,
        )}
    </>
  );
}
