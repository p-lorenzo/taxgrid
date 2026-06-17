# 📊 TaxGrid

![Vue.js](https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vue.js&logoColor=4FC08D)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)

**TaxGrid** è una Single Page Application (SPA) open-source sviluppata in Vue 3 pensata per risolvere il problema della frammentazione e della poca chiarezza del sistema fiscale italiano. 

Fornisce un pannello comparativo in tempo reale per calcolare, confrontare e ottimizzare il "Netto in Tasca" tra i principali regimi fiscali: **Partita IVA Forfettaria**, **Partita IVA Ordinaria** e **S.R.L. (con distribuzione utili o compenso amministratore)**.

---

## ✨ Funzionalità Principali

- ⚡️ **Confronto in Tempo Reale**: Inserisci fatturato, spese e altri parametri e osserva immediatamente come variano le tasse, i contributi INPS e il netto finale nei vari regimi.
- 🔒 **Privacy-First (Client-side)**: Nessun database, nessuna registrazione. I calcoli avvengono interamente nel tuo browser e i dati sensibili vengono salvati unicamente nel `localStorage` del tuo dispositivo.
- ⚙️ **Motore Fiscale Avanzato**: Calcolo preciso degli scaglioni IRPEF 2024, supporto per coefficienti ATECO preimpostati, deduzioni e detrazioni personali al 19%, e calcolo accurato del costo aziendale INPS per gli amministratori di S.R.L.
- 🎨 **UX/UI Moderna**: Interfaccia reattiva, esteticamente curata e completamente responsive, basata su un design system unificato in Tailwind CSS v4 e componenti Headless UI.

## 🛠️ Tecnologie Utilizzate

Questo progetto è stato costruito seguendo le migliori pratiche dello sviluppo frontend moderno:
- **Framework:** Vue 3 (Composition API)
- **State Management:** Pinia (con sincronizzazione persistente locale)
- **Styling:** Tailwind CSS v4 + Headless UI
- **Build Tool:** Vite
- **Linguaggio:** TypeScript (Strict Mode)

> **🤖 AI-Driven Development**: Il ciclo di vita e l'evoluzione di questo progetto sfruttano l'architettura **Ralph Wiggum**, un workflow sperimentale per l'automazione dello sviluppo tramite Agenti AI autonomi basati su *Behavior-Driven Specifications* e loop retroattivi via terminale. Le specifiche di dominio (`specs/`) fungono da contratto diretto tra i requisiti di business e l'agente programmatore.

## 🚀 Getting Started

Per eseguire TaxGrid in locale sulla tua macchina, assicurati di avere Node.js installato.

```bash
# 1. Clona il repository
git clone https://github.com/tuousername/taxgrid.git
cd taxgrid

# 2. Installa le dipendenze
npm install

# 3. Avvia il server di sviluppo
npm run dev
```

Apri `http://localhost:5173` nel tuo browser per iniziare la simulazione.

## 🤝 Contribuire

Le contribuzioni sono molto apprezzate! Il progetto è strutturato tramite "Spec Files" all'interno della cartella `specs/`. Se desideri aggiungere un nuovo regime fiscale o fixare un calcolo:
1. Apri una Issue discutendo la modifica.
2. Crea una specifica (Spec) nel formato appropriato.
3. Fai girare l'agente locale (via `scripts/ralph-loop-agy.sh`) o scrivi il codice manualmente.
4. Apri una Pull Request.

## 📄 Licenza

Questo progetto è distribuito sotto licenza **MIT**. Sentiti libero di utilizzarlo, modificarlo e distribuirlo.
