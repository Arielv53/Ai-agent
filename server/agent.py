import os
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain.agents import create_tool_calling_agent, AgentExecutor
from typing import List
from dotenv import load_dotenv
from .tools import tools

load_dotenv()


llm = ChatOpenAI(model="gpt-3.5-turbo")

# prompt template
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system", # info to the llm so it knows its purpose
            """
            You are a smart fishing assistant that helps anglers catch more fish using provided data from previously logged catches.
            Use tools like tide_weather_lookup and catch_history_analyzer to help users.
            Always try to be helpful and conversational. Don't force answers into a strict format unless specifically asked.
            """,
        ),
        ("placeholder", "{chat_history}"),
        ("human", "{query}"),
        ("placeholder", "{agent_scratchpad}"),
    ]
)


# create & run agent
agent = create_tool_calling_agent(
    llm=llm,
    prompt=prompt,
    tools=tools
)

agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True) # verbose = true to show agents thought process

if __name__ == "__main__":
    query = input("What can I help you with today? ")
    response = agent_executor.invoke({"query": query})
    print(response["output"])