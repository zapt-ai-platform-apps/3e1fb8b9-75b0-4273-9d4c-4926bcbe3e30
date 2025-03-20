# PDF Programming Quiz Generator

An interactive application for generating programming quizzes from uploaded PDF documents. The app analyzes programming language learning PDFs and creates custom quizzes based on the document content.

## Features

- PDF upload and analysis
- Automatic question generation based on PDF content
- Multiple question types (multiple choice, fill-in-the-blank, code analysis)
- Answer feedback with explanations
- Progress tracking
- Adaptive difficulty based on performance

## Technology Stack

- **Frontend**: React, TailwindCSS
- **Backend**: Node.js on Vercel Serverless Functions
- **PDF Processing**: pdf-parse, pdfjs-dist
- **NLP & RAG**: LangChain, OpenAI
- **Vector Database**: In-memory embedding storage
- **Database**: CockroachDB with Drizzle ORM

## Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Set up environment variables in `.env` file
4. Run the development server with `npm run dev`

## How It Works

The application uses Retrieval Augmented Generation (RAG) to create questions based on PDF content:

1. **PDF Processing**: When a PDF is uploaded, the system extracts text and code snippets
2. **Embedding Generation**: The content is converted to vector embeddings
3. **Question Generation**: The system uses the embeddings to generate relevant questions
4. **Answer Checking**: User answers are evaluated against the PDF content
5. **Adaptive Learning**: Question difficulty adjusts based on user performance

---

Made on [ZAPT](https://www.zapt.ai)