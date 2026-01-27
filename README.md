# Twitter Script

## Description

This project collects data from X (Twitter) using two parts:

- **Python** handles scraping data from Twitter using `twikit`.
- **Node.js / TypeScript** runs the Python scripts, receives the data, and works with it (saving, processing, etc.).

---

## Project environments

The `.env` file with script variables must be placed in the Nodejs working directory: node-js-main/.env
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

## Launch script

1. **login to twitter and save cookies**;

```bash
cd python-twikit
source .venv/bin/activate
python src/login.py
```

2. **launch main script**;

```bash
cd node-js-main
npm run start
```