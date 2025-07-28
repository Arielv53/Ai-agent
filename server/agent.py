import os
from pydantic import BaseModel
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv

load_dotenv()

llm = ChatOpenAI(
    model="gpt-3.5-turbo",
    temperature=0.7)
response = llm.invoke("What is the meaning of life?")
print(response.content)