import os
from typing import Annotated, TypedDict
from langchain_core.tools import tool
from langchain_groq import ChatGroq
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode, tools_condition
from dotenv import load_dotenv

load_dotenv()

# 1. Define the State (how memory is passed around)
class State(TypedDict):
    messages: Annotated[list, add_messages]

# ==========================================
# 2. Define the 5 Required Tools
# ==========================================

@tool
def log_interaction(hcp_name: str, notes: str, topics: str) -> str:
    """Log a new interaction with a Healthcare Professional (HCP)."""
    # In a full app, this would insert into the SQLAlchemy DB.
    return f"Successfully logged interaction for {hcp_name}. Notes saved."

@tool
def edit_interaction(hcp_name: str, new_notes: str) -> str:
    """Edit or update an existing interaction log."""
    return f"Updated the interaction log for {hcp_name} with new information."

@tool
def search_hcp_history(hcp_name: str) -> str:
    """Search the past history of interactions with an HCP."""
    return f"Found past interaction history for {hcp_name}. Previously discussed product efficacy."

@tool
def schedule_follow_up(hcp_name: str, date: str, task_description: str) -> str:
    """Schedule a follow-up action item for an HCP."""
    return f"Scheduled a follow-up on {date} for {hcp_name}. Task: {task_description}."

@tool
def analyze_sentiment(notes: str) -> str:
    """Analyze the sentiment of the interaction notes (Positive, Negative, Neutral)."""
    text = notes.lower()
    if "great" in text or "positive" in text or "happy" in text or "good" in text:
        return "Positive"
    elif "bad" in text or "negative" in text or "upset" in text:
        return "Negative"
    return "Neutral"

# List of tools to bind to the agent
tools = [
    log_interaction, 
    edit_interaction, 
    search_hcp_history, 
    schedule_follow_up, 
    analyze_sentiment
]

# ==========================================
# 3. Initialize Groq LLM & LangGraph
# ==========================================

# Using gemma2-9b-it to strictly comply with the assignment instructions.
llm = ChatGroq(
    model="gemma2-9b-it", 
    temperature=0, 
    api_key=os.getenv("GROQ_API_KEY")
)

llm_with_tools = llm.bind_tools(tools)

def chatbot(state: State):
    return {"messages": [llm_with_tools.invoke(state["messages"])]}

# Build the Graph
graph_builder = StateGraph(State)
graph_builder.add_node("chatbot", chatbot)

tool_node = ToolNode(tools=tools)
graph_builder.add_node("tools", tool_node)

# Add edges (Logic Flow)
graph_builder.add_conditional_edges("chatbot", tools_condition)
graph_builder.add_edge("tools", "chatbot")
graph_builder.add_edge(START, "chatbot")

# Compile the final agent graph
app_graph = graph_builder.compile()