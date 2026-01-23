# Twitter Script

## Description

This project collects data from X (Twitter) using two parts:

- **Python** handles scraping data from Twitter using `twikit`.
- **Node.js / TypeScript** runs the Python scripts, receives the data, and works with it (saving, processing, etc.).

At the moment, `cookies.json` must be created **manually**.  
You need to log in to Twitter in your browser and copy cookies into  
`python-twikit/cookies.json` (see `python-twikit/cookies.example.json` for the format).

---

## Project environments

The `.env` file with Twitter credentials must be placed in the Python working directory: python-twikit/.env

---

## Installation

1. **Python**:

```bash
cd python-twikit
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

2. **Node.js**:

```bash
cd node-js-main
npm install
npx prisma generate
```