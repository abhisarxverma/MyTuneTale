from google import genai
from pydantic import BaseModel
import json
from .new_model import VibeSummary
from .utils import give_prompt

def createStory(data):
    try:

        if not data: 
            return {"success" : "false", "message" : "Input data is empty!", "data" : {}}


        client = genai.Client()
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=give_prompt(data),
            config={
                "response_mime_type": "application/json",
                "response_schema": VibeSummary,
            },
        )

        parsed_json = json.loads(response.text)

        return {"success" : "true", "message" : "Story created successfully", "data" : parsed_json}

    except Exception as e:
        return {"success" : "false", "message" : f"Error occured in creating Story : {e}", "data" : {}}