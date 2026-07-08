# AI-First CRM: HCP Interaction Logger

This project is an AI-first Customer Relationship Management (CRM) module designed for Life Science field representatives to log interactions with Healthcare Professionals (HCPs). It features a dual-interface allowing users to log data via a traditional structured form or a conversational AI chat interface.

## Tech Stack

- **Frontend:** React (Vite), Redux Toolkit, Tailwind CSS, Google Inter Font.
- **Backend:** Python, FastAPI, SQLAlchemy.
- **Database:** MySQL.
- **AI Agent Framework:** LangGraph.
- **LLM:** Groq (gemma2-9b-it / llama-3.3-70b-versatile).

## LangGraph AI Agent & Tools

The core of this application is powered by a LangGraph agent. When a user types a message in the chat, the agent interprets the natural language and intelligently calls specific tools to extract and process the data, which then instantly auto-fills the frontend form.

**The 5 Sales-Related Tools utilized by the agent are:**

1. **`log_interaction`**: Captures raw interaction data (HCP name, topics, outcomes) from natural language and prepares it for database insertion.
2. **`edit_interaction`**: Allows the user to modify or append data to an already logged interaction via chat.
3. **`search_hcp_history`**: Retrieves past interaction contexts to help the rep prepare for a meeting.
4. **`schedule_follow_up`**: Extracts dates and tasks to schedule follow-up actions (e.g., "Remind me to send brochures next week").
5. **`analyze_sentiment`**: Analyzes the conversational notes to infer the HCP's sentiment (Positive, Negative, Neutral) and auto-selects the corresponding radio button in the UI.

## How to Run the Project

### 1. Database Setup

Ensure you have MySQL running (e.g., via XAMPP) on port `3306`. Create a database named `crm_db`.

### 2. Backend Setup

1. Navigate to the backend directory: `cd backend`
2. Create a virtual environment: `python -m venv venv`
3. Activate the environment:
   - Windows: `venv\Scripts\activate`
   - Mac/Linux: `source venv/bin/activate`
4. Install dependencies: `pip install fastapi uvicorn sqlalchemy pymysql langgraph langchain-groq pydantic python-dotenv`
5. Create a `.env` file in the backend folder (see `.env.example`) and add your Groq API Key.
6. Start the server: `uvicorn main:app --reload`

### 3. Frontend Setup

1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the Vite development server: `npm run dev`
