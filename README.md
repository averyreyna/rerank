# Rerank

Rerank is a text summarization tool that compares multiple algorithms to help you extract key insights from documents. The application uses TextRank, LexRank, and BART models to analyze your text in real time, offering different approaches to summarization and allowing you to choose the most effective method for your specific content.

<p align="center">
  <img src="rerank.gif" />
</p>

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v16 or later)
- npm (v8 or later)

## Local Development

1. Clone the repository:

```bash
git clone https://github.com/yourusername/rerank.git
cd rerank
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

You can also optionally gate access to the app behind a simple global password:

```
REACT_APP_PASSWORD=your_shared_password_here
```

This is a frontend-only access gate intended for light protection (for example, to keep casual visitors out of a demo). It does **not** provide strong security—determined users can still inspect client-side code and network traffic.

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Available Scripts

- `npm start` - Start the development server
- `npm run build` - Build the application for production  
- `npm test` - Run the test suite
- `npm run eject` - Eject from Create React App (irreversible)
