
from langchain_google_genai import ChatGoogleGenerativeAI
import os

def get_llm():
    return ChatGoogleGenerativeAI(
        # model="gemini-3-pro-preview",
        model="gemini-2.5-pro",
        temperature=0.2,
        max_output_tokens=10000,
        api_key=os.getenv("GOOGLE_API_KEY")
    )
