#!/usr/bin/env python3
"""Generates the static pages of Toneday in English and Italian from one template.
Run:  python3 tools/build.py  (from the project root). Change SITE when the domain is final."""
import json
from pathlib import Path

SITE = "https://toneday.app"
ROOT = Path(__file__).resolve().parent.parent
VERSION = "8"

C = {
    "en": {
        "path": "/", "other": "/it", "other_label": "Italiano", "other_lang": "it", "locale": "en_US",
        "title": "Toneday · One color a day, one artwork a week",
        "desc": "Pick the color of how you feel, every day. On Sunday your seven colors become a living artwork with its own music. A gentle mood journal: free, private, no account.",
        "og_alt": "Toneday: soft colors blending into one artwork",
        "skip": "Skip to content",
        "nav_how": "How it works", "nav_faq": "Questions",
        "eyebrow": "A color a day",
        "lede": "Pick the color of how you feel. On Sunday, your seven colors become one artwork you can see and hear.",
        "start": "Pick today’s color", "example": "Hear an example week",
        "phones": "Best with headphones", "scroll": "How it works",
        "listen_t": "Put your headphones on", "listen_s": "Sound is part of the artwork.", "listen_cta": "Tap to listen", "listen_skip": "Continue without sound",
        "intro_h": "Not a tracker. A canvas.",
        "intro_p": [
            "Toneday asks one question a day, without words: what color is today? There are no scores, no streaks and no charts. You move your finger, the ink spreads, and the sound changes with it.",
            "At the end of the week your days blend into a single artwork with its own melody. Even the grey days make something beautiful."
        ],
        "steps_h": "Three moments",
        "steps": [
            ("Every day", "Choose a color", "Around the circle the color changes, toward the edge it grows more intense. Each color has its own sound, so you hear it while you choose."),
            ("Sunday evening", "Watch it come together", "Your days fall like drops, one by one, and melt into an artwork that moves slowly and plays its own melody."),
            ("All week after", "Keep it with you", "Save it as your phone wallpaper. The same seven colors never take the same shape twice."),
        ],
        "prin_h": "Made to be gentle",
        "prin": [
            ("No pressure", "No streaks, no badges, no guilt. A skipped day becomes a pause in the music."),
            ("No numbers", "No scores or statistics about your mood. Only color and sound."),
            ("Private by design", "Your colors stay in your browser. No account and no ads. We only count anonymous visits, without cookies."),
            ("Made for everyone", "Every color is described in words for screen readers, and every week can be listened to, not only seen."),
        ],
        "faq_h": "Questions",
        "faq": [
            ("Is Toneday free?", "Yes, completely. No ads, no subscription, no account."),
            ("Where are my colors saved?", "Only on your device, in your browser. Nothing is sent to a server. If you clear your browser data, your colors go with it."),
            ("Do I need headphones?", "No, but they help. The sound is part of the artwork: with headphones each day has its own place around you, from Monday on the left to Sunday on the right."),
            ("Why does every color have a sound?", "Each color plays one note of the same chord, so every week sounds harmonious. Warm colors sound rounder, blues more liquid, greens like wind, dark colors deeper. Nothing you choose can sound wrong."),
            ("Can I install it on my phone?", "Yes. On iPhone, open it in Safari, tap Share and then Add to Home Screen. On Android, choose Install app from the browser menu. It also works offline."),
            ("Is it a therapy or mental health app?", "No. Toneday is a gentle daily ritual, not a medical or psychological tool. If you are going through a hard time, talking to someone can help: findahelpline.com lists free, confidential support near you."),
        ],
        "cta_h": "What color is today?",
        "foot": "Toneday · Free, private, made with care.",
        "privacy": "Privacy", "help": "Having a hard time? Find free support near you at",
        "privacy_path": "/privacy",
        # app UI
        "close": "Close", "sound": "Sound",
        "surface": "Color surface. Move your finger around the circle, or use the arrow keys: left and right change the color, up and down the intensity. Press Enter to keep it.",
        "light": "Light", "dark": "dark", "bright": "bright",
        "leave_empty": "Leave empty", "keep": "Keep this color",
        "week_h": "Your week", "week_note": "Your artwork reveals itself on Sunday evening. No hurry.",
        "paint_hover": "Move the cursor: you are painting, and every color sounds.", "paint_touch": "Tap anywhere: every color leaves a drop, and a note.",
        "today_label": "Today", "change_today": "Change today’s color", "install_h": "Keep Toneday close", "install_btn": "Add to Home Screen",
        "tela": "The canvas so far", "home": "Toneday home",
        "skip_reveal": "Skip", "reshape": "New shape", "as_wall": "Use as wallpaper", "back_week": "Back to your week",
        "melody": "The melody of the week",
        "wall_note": "This is how it looks on your lock screen. Saved at your screen’s full resolution.",
        "phone_alt": "Preview of the wallpaper on a lock screen",
    },
    "it": {
        "path": "/it", "other": "/", "other_label": "English", "other_lang": "en", "locale": "it_IT",
        "title": "Toneday · Un colore al giorno, un’opera a settimana",
        "desc": "Scegli ogni giorno il colore di come ti senti. Domenica i tuoi sette colori diventano un’opera viva con la sua musica. Un diario delle emozioni gentile: gratis, privato, senza account.",
        "og_alt": "Toneday: colori morbidi che si fondono in un’opera",
        "skip": "Vai al contenuto",
        "nav_how": "Come funziona", "nav_faq": "Domande",
        "eyebrow": "Un colore al giorno",
        "lede": "Scegli il colore di come ti senti. Domenica i tuoi sette colori diventano un’opera da guardare e da ascoltare.",
        "start": "Scegli il colore di oggi", "example": "Ascolta una settimana di esempio",
        "phones": "Meglio con le cuffie", "scroll": "Come funziona",
        "listen_t": "Indossa le cuffie", "listen_s": "Il suono è parte dell’opera.", "listen_cta": "Tocca per ascoltare", "listen_skip": "Continua senza suono",
        "intro_h": "Non un tracker. Una tela.",
        "intro_p": [
            "Toneday ti fa una sola domanda al giorno, senza parole: di che colore è oggi? Niente punteggi, niente serie da mantenere, niente grafici. Muovi il dito, l’inchiostro si allarga e il suono cambia con lui.",
            "A fine settimana i tuoi giorni si fondono in un’unica opera con la sua melodia. Anche i giorni grigi creano qualcosa di bello."
        ],
        "steps_h": "Tre momenti",
        "steps": [
            ("Ogni giorno", "Scegli un colore", "Intorno al cerchio cambia il colore, verso il bordo diventa più intenso. Ogni colore ha il suo suono, così lo senti mentre scegli."),
            ("Domenica sera", "Guardala nascere", "I tuoi giorni cadono come gocce, uno alla volta, e si fondono in un’opera che si muove piano e suona la sua melodia."),
            ("La settimana dopo", "Portala con te", "Salvala come sfondo del telefono. Gli stessi sette colori non prendono mai due volte la stessa forma."),
        ],
        "prin_h": "Pensata per essere gentile",
        "prin": [
            ("Nessuna pressione", "Niente serie da mantenere, niente notifiche rosse, niente sensi di colpa. Un giorno saltato diventa una pausa nella musica."),
            ("Nessun numero", "Nessun punteggio, nessuna statistica sul tuo umore. Solo colore e suono."),
            ("Privata per scelta", "I tuoi colori restano nel tuo browser. Nessun account e nessuna pubblicità. Contiamo solo le visite in forma anonima, senza cookie."),
            ("Per tutte le persone", "Ogni colore è descritto a parole per i lettori di schermo, e ogni settimana si può ascoltare, non solo guardare."),
        ],
        "faq_h": "Domande",
        "faq": [
            ("Toneday è gratis?", "Sì, del tutto. Nessuna pubblicità, nessun abbonamento, nessun account."),
            ("Dove vengono salvati i miei colori?", "Solo sul tuo dispositivo, nel browser. Nulla viene inviato a un server. Se cancelli i dati del browser, i tuoi colori se ne vanno con loro."),
            ("Servono le cuffie?", "No, ma aiutano. Il suono fa parte dell’opera: in cuffia ogni giorno ha il suo posto intorno a te, dal lunedì a sinistra alla domenica a destra."),
            ("Perché ogni colore ha un suono?", "Ogni colore suona una nota dello stesso accordo, così ogni settimana è armoniosa. I colori caldi suonano più rotondi, i blu più liquidi, i verdi come vento, i colori scuri più profondi. Niente di ciò che scegli può suonare male."),
            ("Posso installarla sul telefono?", "Sì. Su iPhone aprila in Safari, tocca Condividi e poi Aggiungi alla schermata Home. Su Android scegli Installa app dal menu del browser. Funziona anche offline."),
            ("È un’app di terapia o di salute mentale?", "No. Toneday è un piccolo rituale quotidiano, non uno strumento medico o psicologico. Se stai attraversando un momento difficile, parlarne con qualcuno può aiutare: su findahelpline.com trovi supporto gratuito e riservato vicino a te."),
        ],
        "cta_h": "Di che colore è oggi?",
        "foot": "Toneday · Gratis, privata, fatta con cura.",
        "privacy": "Privacy", "help": "Un momento difficile? Trovi supporto gratuito vicino a te su",
        "privacy_path": "/it/privacy",
        "close": "Chiudi", "sound": "Suono",
        "surface": "Superficie del colore. Muovi il dito intorno al cerchio, oppure usa le frecce: sinistra e destra cambiano il colore, su e giù l’intensità. Premi Invio per tenerlo.",
        "light": "Luce", "dark": "scuro", "bright": "chiaro",
        "leave_empty": "Lascia vuoto", "keep": "Tengo questo colore",
        "week_h": "La tua settimana", "week_note": "La tua opera si rivela domenica sera. Nessuna fretta.",
        "paint_hover": "Muovi il cursore: stai dipingendo, e ogni colore suona.", "paint_touch": "Tocca dove vuoi: ogni colore lascia una goccia, e una nota.",
        "today_label": "Oggi", "change_today": "Cambia il colore di oggi", "install_h": "Tieni Toneday a portata di mano", "install_btn": "Aggiungi alla Home",
        "tela": "La tela finora", "home": "Home di Toneday",
        "skip_reveal": "Salta", "reshape": "Nuova forma", "as_wall": "Usa come sfondo", "back_week": "Torna alla settimana",
        "melody": "La melodia della settimana",
        "wall_note": "Così sulla schermata di blocco. Viene salvato alla piena risoluzione del tuo schermo.",
        "phone_alt": "Anteprima dello sfondo sulla schermata di blocco",
    },
}

ICON_PHONES = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="5" height="7" rx="2"/><rect x="16" y="14" width="5" height="7" rx="2"/></svg>'
ICON_SOUND = '<svg class="on" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/><path d="M19 6a8.5 8.5 0 0 1 0 12"/></svg><svg class="off" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M17 9l5 6M22 9l-5 6"/></svg>'
ICON_CLOSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'
ICON_DOWN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>'

SWATCHES = ["hsl(212,55%,42%)", "hsl(228,10%,40%)", "hsl(336,50%,62%)", "hsl(140,50%,44%)", "hsl(24,78%,55%)", "hsl(276,42%,48%)", "hsl(48,80%,66%)"]


def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")


def head(lang, c, path, title, desc, extra=""):
    other = c["other"] if path == c["path"] else (C[c["other_lang"]]["privacy_path"])
    en_url = SITE + (C["en"]["path"] if path == c["path"] else C["en"]["privacy_path"])
    it_url = SITE + (C["it"]["path"] if path == c["path"] else C["it"]["privacy_path"])
    return f"""<!doctype html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">
<link rel="canonical" href="{SITE}{path}">
<link rel="alternate" hreflang="en" href="{en_url}">
<link rel="alternate" hreflang="it" href="{it_url}">
<link rel="alternate" hreflang="x-default" href="{en_url}">
<meta name="theme-color" content="#0b0d14">
<meta name="color-scheme" content="dark">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
<link rel="manifest" href="{'/manifest.webmanifest' if lang == 'en' else '/it/manifest.webmanifest'}">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Toneday">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Toneday">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(desc)}">
<meta property="og:url" content="{SITE}{path}">
<meta property="og:image" content="{SITE}/og-{lang}.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="{esc(c['og_alt'])}">
<meta property="og:locale" content="{c['locale']}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{esc(title)}">
<meta name="twitter:description" content="{esc(desc)}">
<meta name="twitter:image" content="{SITE}/og-{lang}.png">
<link rel="preload" href="/assets/fonts/cormorant-garamond-latin-300-italic.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/figtree-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/app.css?v={VERSION}">
<script>window.va = window.va || function () {{ (window.vaq = window.vaq || []).push(arguments); }};</script>
<script defer src="/_vercel/insights/script.js"></script>
{extra}</head>"""


def jsonld(lang, c):
    app = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Toneday",
        "url": SITE + c["path"],
        "description": c["desc"],
        "applicationCategory": "LifestyleApplication",
        "operatingSystem": "Any",
        "browserRequirements": "Requires JavaScript",
        "inLanguage": lang,
        "isAccessibleForFree": True,
        "offers": {"@type": "Offer", "price": "0", "priceCurrency": "EUR"},
        "image": f"{SITE}/og-{lang}.png",
    }
    faq = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "inLanguage": lang,
        "mainEntity": [
            {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in c["faq"]
        ],
    }
    return (
        f'<script type="application/ld+json">{json.dumps(app, ensure_ascii=False)}</script>\n'
        f'<script type="application/ld+json">{json.dumps(faq, ensure_ascii=False)}</script>\n'
    )


def footer(c):
    return f"""<footer class="footer gutter">
  <span>{esc(c['foot'])}</span>
  <nav aria-label="Footer">
    <a href="{c['privacy_path']}">{c['privacy']}</a>
    <a href="{c['other']}" hreflang="{c['other_lang']}" lang="{c['other_lang']}">{c['other_label']}</a>
  </nav>
  <p class="help">{esc(c['help'])} <a href="https://findahelpline.com" rel="noopener" target="_blank">findahelpline.com</a></p>
</footer>"""


def index(lang):
    c = C[lang]
    steps = "\n".join(
        f"""      <li>
        <span class="when">{esc(w)}</span>
        <h3>{esc(h)}</h3>
        <p>{esc(p)}</p>
      </li>""" for w, h, p in c["steps"])
    prin = "\n".join(f"""      <div><h3>{esc(h)}</h3><p>{esc(p)}</p></div>""" for h, p in c["prin"])
    faq = "\n".join(f"""      <details><summary>{esc(q)}</summary><p>{esc(a)}</p></details>""" for q, a in c["faq"])
    intro = "\n".join(f"      <p>{esc(p)}</p>" for p in c["intro_p"])
    sw = "".join(f'<span style="background:{x}"></span>' for x in SWATCHES)
    return head(lang, c, c["path"], c["title"], c["desc"], jsonld(lang, c)) + f"""
<body>
<a class="sr-only" href="#main">{c['skip']}</a>
<div id="stage" aria-hidden="true"><canvas id="stageGl"></canvas><canvas id="stageCv"></canvas></div>

<div id="listen" role="dialog" aria-modal="true" aria-labelledby="listen-t" hidden>
  <span class="listen-ic" aria-hidden="true">{ICON_PHONES}</span>
  <span class="listen-t" id="listen-t">{esc(c['listen_t'])}</span>
  <span class="listen-s">{esc(c['listen_s'])}</span>
  <button class="btn primary listen-cta" id="listenGo" type="button">{esc(c['listen_cta'])}</button>
  <button class="btn text listen-skip" id="listenSkip" type="button">{esc(c['listen_skip'])}</button>
</div>

<div id="landing">
  <header class="hero gutter">
    <div class="topbar">
      <a class="wordmark" href="{c['path']}" data-home aria-label="{c['home']}">Toneday</a>
      <nav class="topnav" aria-label="Main">
        <a href="#how">{c['nav_how']}</a>
        <a href="{c['other']}" hreflang="{c['other_lang']}" lang="{c['other_lang']}">{c['other_lang'].upper()}</a>
        <button class="icon-btn sound-toggle" type="button" aria-pressed="true" aria-label="{c['sound']}">{ICON_SOUND}</button>
      </nav>
    </div>
    <div class="hero-copy">
      <p class="eyebrow">{esc(c['eyebrow'])}</p>
      <h1>Toneday</h1>
      <p class="lede">{esc(c['lede'])}</p>
      <p class="paint-hint" id="paintHint"><span class="brush-dot" aria-hidden="true"></span><span id="paintHintText">{esc(c['paint_touch'])}</span></p>
      <div class="hero-actions">
        <button class="btn" type="button" id="heroWeek" hidden>{esc(c['week_h'])}</button>
        <button class="btn primary" type="button" data-start id="heroStart">{esc(c['start'])}</button>
        <button class="btn" type="button" data-example id="heroExample">{esc(c['example'])}</button>
      </div>
      <div class="hero-actions">
        <span id="phones" class="phones muted"><span class="ic">{ICON_PHONES}</span><span id="phonesText">{esc(c['phones'])}</span><span class="bars" aria-hidden="true"><i></i><i></i><i></i></span></span>
        <a class="scroll-cue" href="#how">{esc(c['scroll'])} {ICON_DOWN}</a>
      </div>
    </div>
  </header>

  <main id="main" class="about gutter">
    <div class="about-inner">
      <section class="intro" aria-labelledby="intro-h">
        <h2 id="intro-h">{esc(c['intro_h'])}</h2>
        <div style="display:grid;gap:16px">
{intro}
        </div>
      </section>

      <section id="how" aria-labelledby="how-h">
        <h2 id="how-h">{esc(c['steps_h'])}</h2>
        <ol class="steps">
{steps}
        </ol>
        <div class="swatch-row" aria-hidden="true" style="margin-top:22px">{sw}</div>
      </section>

      <section aria-labelledby="prin-h">
        <h2 id="prin-h">{esc(c['prin_h'])}</h2>
        <div class="principles">
{prin}
        </div>
      </section>

      <section id="faq" aria-labelledby="faq-h">
        <h2 id="faq-h">{esc(c['faq_h'])}</h2>
        <div class="faq">
{faq}
        </div>
      </section>

      <section class="cta-band" aria-labelledby="cta-h">
        <h2 id="cta-h">{esc(c['cta_h'])}</h2>
        <div class="hero-actions">
          <button class="btn primary" type="button" data-start>{esc(c['start'])}</button>
          <button class="btn" type="button" data-example>{esc(c['example'])}</button>
        </div>
      </section>
    </div>
  </main>
  {footer(c)}
</div>

<section id="checkin" class="screen" hidden aria-labelledby="ciQuestion">
  <canvas id="ink" tabindex="0" aria-label="{esc(c['surface'])}"></canvas>
  <div class="top gutter">
    <div>
      <p class="eyebrow" id="ciDay"></p>
      <h2 class="question" id="ciQuestion"></h2>
      <p class="phrase" aria-live="polite"><span class="sw" id="ciSw" hidden></span><span id="ciPhrase"></span></p>
    </div>
    <div class="actions-r">
      <button class="icon-btn sound-toggle" type="button" aria-pressed="true" aria-label="{c['sound']}">{ICON_SOUND}</button>
      <button class="icon-btn" id="closeCheckin" type="button" aria-label="{c['close']}">{ICON_CLOSE}</button>
    </div>
  </div>
  <div class="bottom gutter">
    <div class="light-row">
      <label for="lightRange">{c['light']}</label>
      <span class="end">{c['dark']}</span>
      <input type="range" id="lightRange" min="12" max="84" value="50">
      <span class="end">{c['bright']}</span>
    </div>
    <div class="row">
      <button id="skipBtn" class="btn" type="button">{esc(c['leave_empty'])}</button>
      <button id="keepBtn" class="btn primary grow" type="button" disabled>{esc(c['keep'])}</button>
    </div>
  </div>
</section>

<section id="week" class="screen" hidden aria-labelledby="week-h">
  <div class="week-inner gutter">
    <div class="week-head">
      <a class="wordmark" href="{c['path']}" data-home aria-label="{c['home']}">Toneday</a>
      <button class="icon-btn sound-toggle" type="button" aria-pressed="true" aria-label="{c['sound']}">{ICON_SOUND}</button>
    </div>
    <div style="display:grid;gap:8px">
      <p class="eyebrow" id="weekRange"></p>
      <h2 class="display" id="week-h" style="font-size:40px">{esc(c['week_h'])}</h2>
    </div>
    <ol class="drops" id="drops"></ol>
    <section class="today-card" id="todayCard" aria-live="polite">
      <p class="eyebrow">{c['today_label']}</p>
      <p class="display tc-title" id="tcTitle"></p>
      <p class="phrase" id="tcPhrase"><span class="sw" id="tcSw"></span><span id="tcPhraseText"></span></p>
      <p class="tc-next" id="tcNext"></p>
      <p class="note" id="tcMissing" hidden></p>
    </section>
    <div class="week-actions">
      <button id="todayBtn" class="btn primary" type="button">{esc(c['start'])}</button>
      <button id="revealBtn" class="btn" type="button"></button>
    </div>
    <div class="tela">
      <canvas id="telaGl" aria-hidden="true"></canvas>
      <canvas id="telaCv" aria-hidden="true"></canvas>
      <div class="cap">
        <div style="display:grid;gap:4px">
          <p class="eyebrow" style="color:#d4d1e0">{esc(c['tela'])}</p>
          <p class="display" id="telaText"></p>
        </div>
        <p class="count" id="telaCount"></p>
      </div>
    </div>
    <div class="week-links">
      <button id="changeBtn" class="btn text" type="button">{esc(c['change_today'])}</button>
      <button class="btn text" type="button" data-example>{esc(c['example'])}</button>
    </div>
    <aside class="install" id="installCard" hidden aria-labelledby="install-h">
      <div style="display:grid;gap:4px;min-width:0">
        <p id="install-h" style="margin:0;font-weight:600">{esc(c['install_h'])}</p>
        <p class="note" id="installText"></p>
      </div>
      <div class="row">
        <button id="installBtn" class="btn" type="button" hidden>{esc(c['install_btn'])}</button>
        <button id="installClose" class="icon-btn install-x" type="button" aria-label="{c['close']}">{ICON_CLOSE}</button>
      </div>
    </aside>
  </div>
</section>

<section id="reveal" class="screen" hidden aria-label="{esc(c['melody'])}">
  <div class="tapzone" id="tapzone"></div>
  <div class="top gutter">
    <div>
      <p class="eyebrow" id="revRange" style="color:#d4d1e0"></p>
      <p class="caption" id="revCaption" aria-live="polite"></p>
    </div>
    <div class="actions-r">
      <button class="icon-btn sound-toggle" type="button" aria-pressed="true" aria-label="{c['sound']}">{ICON_SOUND}</button>
    </div>
  </div>
  <div class="bottom gutter">
    <div class="row" id="melodyRow" hidden style="justify-content:space-between">
      <span class="note" style="color:#d4d1e0">{esc(c['melody'])}</span>
      <span class="melody" id="melody" aria-hidden="true"></span>
    </div>
    <div class="row"><button id="skipReveal" class="btn" type="button">{esc(c['skip_reveal'])}</button></div>
    <div class="reveal-actions" id="revActions" hidden>
      <button id="reshapeBtn" class="btn" type="button">{esc(c['reshape'])}</button>
      <button id="wallBtn" class="btn" type="button">{esc(c['as_wall'])}</button>
      <button id="backBtn" class="btn primary" type="button">{esc(c['back_week'])}</button>
    </div>
  </div>
  <div id="wall" class="sheet" hidden role="dialog" aria-modal="true" aria-label="{esc(c['as_wall'])}">
    <div class="phone">
      <canvas id="phoneCv" role="img" aria-label="{esc(c['phone_alt'])}"></canvas>
      <div class="lock"><span class="lock-date" id="lockDate"></span><span class="lock-time" id="lockTime"></span></div>
    </div>
    <p class="note" style="max-width:34ch">{esc(c['wall_note'])}</p>
    <div class="row">
      <button id="wallClose" class="btn" type="button">{c['close']}</button>
      <button id="saveWall" class="btn primary" type="button"></button>
    </div>
  </div>
</section>

<script src="/assets/vendor/motion-13.4.6.js" defer></script>
<script src="/assets/app.js?v={VERSION}" defer></script>
</body>
</html>
"""


PRIVACY = {
    "en": ("Privacy · Toneday", "How Toneday handles your data: your colors stay in your browser, visits are counted anonymously without cookies.", [
        ("Short version", "Toneday does not know who you are. There is no account, no advertising and no tracking cookies."),
        ("Your colors", "The colors you choose are saved only in your browser’s local storage, on your device. They are never sent to us or to anyone else. Clearing your browser data deletes them."),
        ("Visit statistics", "We use Vercel Web Analytics to count visits. It does not use cookies and does not identify you: it records anonymous, aggregated data such as the page visited, the country, the browser and the referring site."),
        ("Fonts and other resources", "Fonts and every other file are served from our own site. No content is loaded from third parties while you use Toneday."),
        ("Hosting", "The site is hosted by Vercel Inc. Like any web server, it processes technical data such as your IP address to deliver the pages."),
        ("Not a medical service", "Toneday is a creative ritual, not a medical or psychological service. If you need support, findahelpline.com lists free, confidential helplines in your country."),
        ("Contact", "For any question about privacy, write to [CONTACT EMAIL]."),
    ], "Last updated: October 2026"),
    "it": ("Privacy · Toneday", "Come Toneday tratta i tuoi dati: i colori restano nel tuo browser, le visite sono contate in forma anonima e senza cookie.", [
        ("In breve", "Toneday non sa chi sei. Nessun account, nessuna pubblicità, nessun cookie di tracciamento."),
        ("I tuoi colori", "I colori che scegli vengono salvati solo nella memoria locale del tuo browser, sul tuo dispositivo. Non vengono mai inviati a noi né ad altri. Cancellando i dati del browser li elimini."),
        ("Statistiche di visita", "Usiamo Vercel Web Analytics per contare le visite. Non usa cookie e non ti identifica: registra dati anonimi e aggregati come la pagina visitata, il paese, il browser e il sito di provenienza."),
        ("Caratteri e altre risorse", "I caratteri e ogni altro file sono serviti dal nostro sito. Mentre usi Toneday non viene caricato nulla da terze parti."),
        ("Hosting", "Il sito è ospitato da Vercel Inc. Come ogni server web, tratta dati tecnici come l’indirizzo IP per consegnare le pagine."),
        ("Non è un servizio medico", "Toneday è un rituale creativo, non un servizio medico o psicologico. Se hai bisogno di supporto, su findahelpline.com trovi linee di ascolto gratuite e riservate nel tuo paese."),
        ("Contatti", "Per qualsiasi domanda sulla privacy scrivi a [CONTACT EMAIL]."),
    ], "Ultimo aggiornamento: ottobre 2026"),
}


def privacy(lang):
    c = C[lang]
    title, desc, sections, updated = PRIVACY[lang]
    body = "\n".join(f"<section><h2>{esc(h)}</h2><p>{esc(p)}</p></section>" for h, p in sections)
    return head(lang, c, c["privacy_path"], title, desc) + f"""
<body>
<main class="about gutter" style="padding-block:48px">
  <div class="about-inner" style="max-width:720px;gap:28px">
    <a class="wordmark" href="{c['path']}">Toneday</a>
    <h1 class="display" style="font-size:clamp(44px,8vw,64px)">Privacy</h1>
    <div style="display:grid;gap:26px">
{body}
    </div>
    <p class="note">{updated}</p>
  </div>
</main>
{footer(c)}
<style>.about h2{{font-size:28px;margin-bottom:8px}}</style>
</body>
</html>
"""


def manifest(lang):
    c = C[lang]
    return json.dumps({
        "name": "Toneday",
        "short_name": "Toneday",
        "description": c["desc"],
        "lang": lang,
        "start_url": c["path"],
        "scope": "/",
        "id": c["path"],
        "display": "standalone",
        "orientation": "portrait",
        "background_color": "#0b0d14",
        "theme_color": "#0b0d14",
        "icons": [
            {"src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png"},
            {"src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png"},
            {"src": "/icons/maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"},
        ],
    }, ensure_ascii=False, indent=2)


def main():
    (ROOT / "index.html").write_text(index("en"), encoding="utf-8")
    (ROOT / "it").mkdir(exist_ok=True)
    (ROOT / "it" / "index.html").write_text(index("it"), encoding="utf-8")
    (ROOT / "privacy.html").write_text(privacy("en"), encoding="utf-8")
    (ROOT / "it" / "privacy.html").write_text(privacy("it"), encoding="utf-8")
    (ROOT / "manifest.webmanifest").write_text(manifest("en"), encoding="utf-8")
    (ROOT / "it" / "manifest.webmanifest").write_text(manifest("it"), encoding="utf-8")
    urls = [("/", "/it"), ("/privacy", "/it/privacy")]
    items = []
    for en, it in urls:
        for loc in (en, it):
            items.append(f"""  <url>
    <loc>{SITE}{loc}</loc>
    <xhtml:link rel="alternate" hreflang="en" href="{SITE}{en}"/>
    <xhtml:link rel="alternate" hreflang="it" href="{SITE}{it}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="{SITE}{en}"/>
  </url>""")
    (ROOT / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'
        + "\n".join(items) + "\n</urlset>\n", encoding="utf-8")
    (ROOT / "robots.txt").write_text(f"User-agent: *\nAllow: /\n\nSitemap: {SITE}/sitemap.xml\n", encoding="utf-8")
    print("built for", SITE)


if __name__ == "__main__":
    main()
