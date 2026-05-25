# UX/UI Update Lirld (Dummy Client Review Mode)

This repository contains a working frontend-only dummy clone of the project, configured to run entirely client-side without external backend dependencies, active APIs, or environment variables. It uses local mock data and persistence (`localStorage`) to simulate interaction, making it perfect for UX/UI testing, presentation, and client reviews.

## Getting Started

### Prerequisites

You need [Bun](https://bun.sh/) installed on your machine.

### Installation

Install the project dependencies:

```bash
bun install
```

### Running the Development Server

Start the development server:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### Building for Production

To build the project for production:

```bash
bun run build
```

To run the built production bundle:

```bash
bun start
```
