# 10K Scorer

A minimalist, dark-mode PWA for keeping score in the 10,000 dice game.

## Features

- **Minimalist Design**: Pure black aesthetic, large typography, distraction-free.
- **Game Rules**:
  - **Validation**: Minimum 200 points to open/validate. Must be multiple of 100.
  - **Bars**: Track "bars" (failures). 3 bars = return to checkpoint score.
  - **Cross/Cut**: Landing on another player's score cuts them back by their last turn's score.
- **PWA**: Installable on mobile devices. Offline capable.
- **History**: Undo function available.

## Tech Stack

- React (Vite)
- Tailwind CSS v4
- Lucide React

## Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the dev server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```
