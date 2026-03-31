# CodeQueue Frontend

React frontend for [CodeQueue](https://github.com/AliShawahni/codequeue) — a LeetCode practice tracker with a dual-mode recommendation engine.

## Features

- **Dashboard** — overview of your practice stats
- **Discover** — problems recommended based on your topic weaknesses
- **Review** — priority queue of attempted problems ranked by the scoring algorithm
- **All Problems** — searchable and filterable list of 2913 LeetCode problems with attempt history

## Tech Stack

- React
- CSS Variables for theming
- Fetch API for backend communication

## Running locally

Make sure the backend is running on `localhost:8080` first.
```bash
git clone https://github.com/AliShawahni/codequeue-frontend.git
cd codequeue-frontend
npm install
npm start
```

Frontend runs on `localhost:3000`.

## Backend

The Spring Boot backend is available at [codequeue](https://github.com/AliShawahni/codequeue)
