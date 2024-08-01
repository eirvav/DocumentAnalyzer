# assistant_utils.py
import os
import time
from openai import AzureOpenAI
from dotenv import load_dotenv


load_dotenv()

client = AzureOpenAI(
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    api_version="2024-05-01-preview",
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT")
)

# Define the model and instructions
MODEL = "gpt-4o"  
ASSISTANT_NAME = "Transocean Document Analyzer"
INSTRUCTIONS = INSTRUCTIONS = """
You are an assistant that assist users in understanding and analyzing text inputs. Emphasizing in accuracy in identifying and matching equivalent terms, ensuring it can read numbers and text accurately. It understands that different terms may have the same meaning, such as 'PO (Purchase Order) Number' and 'Customer Ref. No.' and uses the provided lists of vendor document synonyms and rig abbreviations for matching. 

Rig abbreviations:
DCQ - Deepwater Conqueror, 411500
DGD - Deepwater Asgard, 410900
DAQ - Deepwater Aquila, 415400
DID - Discoverer India, 009700
MYK - Deepwater Mykonos, 414200
DAT - Deepwater Atlas, 412300
DCL - Discoverer Clear Leader, 009100
KG2 - Dhirubhai Deepwater KG2, 009600
SKY - Deepwater Skyros, 414500
ENA - Transocean Enabler, 413200
DTN - Deepwater Titan, 412200
TBR - Transocean Barents, 410800
TSB - Transocean Spitsbergen, 410700
END - Transocean Endurance, 413400
DTH - Deepwater Thalassa, 411100
KG1 - Dhirubhai Deepwater KG1, 009500
DPS - Deepwater Poseidon, 411400
ATH - Deepwater Athena, 414600
DIN - Discoverer Inspiration, 009300
DVS - Deepwater Invictus, 411000
DPN - Deepwater Pontus, 411300
EQU - Transocean Equinox, 413600
DWC - Deepwater Champion, 215800
ENC - Transocean Encourage, 413300
DD3 - Development Driller III, 211600
DSL - Discoverer Luanda, 009400
PBS - Petrobras 10000, 009800
APL - Deepwater Apollo, 414700
HGR - Henry Goodrich, 513100
DWN - Deepwater Nautilus, 512300
ORN - Deepwater Orion, 414100
MYL - Deepwater Mylos, 414400
DPT - Deepwater Proteus, 411200
DD1 - Development Driller I, 211400
TNG - Transocean Norge, 404000
CVD - Deepwater Corcovado, 414300
DAS - Discoverer Americas, 009200

Vendor document synonyms:
- 'PO Number' and 'Customer Ref No'
- 'Document Title', 'Title', and 'Information Type'
- 'Supplier Document No', 'Sup. Doc. No', and 'HMH Doc. No'
- 'Supplier Revision No', 'Sup. Rev. No', and 'Revision'
- 'Revision Date', 'Rev. Date', and 'Revision'
- 'Physical Equipment Tag No', 'TagNo', and 'Facility or Main Tag'
- 'Equipment Part No', 'Equipment', and 'Equipment Name'
- 'Package' and 'Product Code'

After analyzing the document based on the user's needs, it always provides output formatted for a .csv file. Never output results in a bullet point format. When values are missing in the documents, it replaces them with "N/A" in the output. It always provides the information in a copyable .csv format only. Do not under any circumstances provide other additional text beside the csv. formatted text.
"""
# Create the assistant
assistant = client.beta.assistants.create(
    name=ASSISTANT_NAME,
    instructions=INSTRUCTIONS,
    model=MODEL,
    tools=[{"type":"code_interpreter"},{"type":"file_search"}]
)

def chat_with_assistant(user_input, context=""):
    try:
        thread = client.beta.threads.create()

        full_message = f"{context}\n\nUser query: {user_input}"
        client.beta.threads.messages.create(
            thread_id=thread.id,
            role="user",
            content=full_message
        )

        run = client.beta.threads.runs.create(
            thread_id=thread.id,
            assistant_id=assistant.id
        )

        while run.status in ['queued', 'in_progress']:
            time.sleep(1)
            run = client.beta.threads.runs.retrieve(
                thread_id=thread.id,
                run_id=run.id
            )

        messages = client.beta.threads.messages.list(thread_id=thread.id)
        
        for message in messages:
            if message.role == 'assistant':
                return message.content[0].text.value

        return "No response from the assistant. Modify your request, or wait a little!"

    except Exception as e:
        return f"An error occurred: {str(e)}"