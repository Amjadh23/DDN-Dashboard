'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, MessageCircle, RotateCcw, Send, X } from 'lucide-react';
import { answerDemoQuestion, assistantWelcome, type AssistantAnswer } from '@/lib/domain/demo-assistant';

type Message = { role: 'user' | 'assistant'; text: string; link?: AssistantAnswer['link'] };

export function DemoAssistant() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [choices, setChoices] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const dialog = useRef<HTMLElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const end = useRef<HTMLDivElement>(null);

  function reset() {
    const greeting = assistantWelcome(path);
    setMessages([{ role: 'assistant', text: greeting.text }]);
    setChoices(greeting.choices);
    setInput('');
  }
  function launch() {
    if (!messages.length) reset();
    setOpen(true);
  }
  function close() {
    setOpen(false);
    launcher.current?.focus();
  }
  function send(text: string) {
    const question = text.trim().slice(0, 500);
    if (!question) return;
    const answer = answerDemoQuestion(question);
    setMessages((history) => [...history.slice(-38), { role: 'user', text: question }, { role: 'assistant', text: answer.text, link: answer.link }]);
    setChoices(answer.choices);
    setInput('');
  }
  useEffect(() => {
    if (open) closeButton.current?.focus();
  }, [open]);
  useEffect(() => {
    if (open) end.current?.scrollIntoView({ block: 'nearest' });
  }, [messages, open]);

  return (
    <>
      <button ref={launcher} className="assistant-launcher" onClick={launch} aria-label="Buka AIDA, pembantu digital Dasar Dadah Negara" aria-expanded={open} aria-controls="ddn-assistant">
        <Image src="/aida-avatar.svg" alt="" width={48} height={48} />
        <span><strong>AIDA</strong><small>Mahu panduan? <MessageCircle size={12} /></small></span>
      </button>
      {open && (
        <>
          <div className="assistant-backdrop" onClick={close} aria-hidden="true" />
          <section id="ddn-assistant" ref={dialog} className="assistant-panel" role="dialog" aria-modal="true" aria-labelledby="assistant-title" onKeyDown={(event) => {
            if (event.key === 'Escape') { event.preventDefault(); close(); }
            if (event.key === 'Tab') {
              const nodes = dialog.current?.querySelectorAll<HTMLElement>('button, a[href], input');
              if (!nodes?.length) return;
              const first = nodes[0], last = nodes[nodes.length - 1];
              if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
              else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
            }
          }}>
            <header className="assistant-header">
              <Image src="/aida-avatar.svg" alt="Watak AIDA" width={58} height={58} />
              <div><h2 id="assistant-title">AIDA</h2><p>Asisten Inteligen Dasar Antidadah</p></div>
              <button className="icon-button" onClick={reset} aria-label="Mulakan perbualan semula"><RotateCcw size={17} /></button>
              <button ref={closeButton} className="icon-button" onClick={close} aria-label="Tutup pembantu"><X size={20} /></button>
            </header>
            <div className="assistant-conversation" role="log" aria-label="Perbualan AIDA" aria-live="polite" aria-relevant="additions text">
              {messages.map((message, i) => <div key={i} className={`assistant-message ${message.role}`}><small>{message.role === 'assistant' ? 'AIDA' : 'ANDA'}</small><p>{message.text}</p>{message.link && <Link href={message.link.href} onClick={close}>{message.link.label}<ArrowUpRight size={14} /></Link>}</div>)}
              <div ref={end} />
            </div>
            <div className="assistant-choices" aria-label="Cadangan soalan">{choices.map(choice => <button key={choice} onClick={() => send(choice)}>{choice}<ArrowUpRight size={13} /></button>)}</div>
            <form className="assistant-compose" onSubmit={event => { event.preventDefault(); send(input); }}>
              <label className="sr-only" htmlFor="assistant-input">Soalan anda</label>
              <input id="assistant-input" value={input} onChange={event => setInput(event.target.value)} maxLength={500} placeholder="Tanya tentang dashboard…" autoComplete="off" />
              <button type="submit" aria-label="Hantar soalan" aria-disabled={!input.trim()}><Send size={18} /></button>
            </form>
            <p className="assistant-privacy">Mesej hanya dalam sesi ini. Elakkan maklumat peribadi.</p>
          </section>
        </>
      )}
    </>
  );
}
