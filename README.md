# Transocean Document Analyzer

### Overview
The Transocean Document Analyzer is a web-based application that utilizes Azure OpenAI to analyze PDF documents and answer questions based on their content. It's designed to process complex documents, extract key information, and provide structured responses in CSV format.

### Features
- PDF document upload and text extraction
- AI-powered document analysis using Azure OpenAI
- Interactive chat interface for querying document content
- CSV output for structured data responses
- Asynchronous request handling with a queuing system
- User-friendly web interface

### Prerequisites
- Python 3.7 or higher
- Azure OpenAI API access (API key and endpoint)
- Git (for cloning the repository)

# Installation

## 1. Clone the repository:
Type: `git clone https://github.com/eirvav/DocumentAnalyzer.git` in the terminal and navigate to the folder

## 2. Create a virtual environment:

### Creating Environments in Visual Studio Code

#### Using the Create Environment Command

To create local environments in Visual Studio Code using either Virtual Environments (`venv`) or Anaconda (`Conda`), you can follow these steps:

-  **Open the Command Palette**:
   
    Press `Ctrl+Shift+P` to open the Command Palette.

- **Search and Select the Command**:
   
   Type `Python: Create Environment` in the search bar and select the command.

- **Choose Environment Type**:
   
   A dropdown list will appear, allowing you to select `Venv`

- **Select Interpreter or Python Version**:
   
   When you choose `Venv`, a list of available Python interpreters will be displayed. Select one to use as the base for your virtual environment.
   
- **Environment Creation**:
   
   Once you've selected the desired interpreter or Python version, a notification will display the progress of the environment creation. The environment folder will be added to your workspace.

### Creating a Virtual Environment in the Terminal

If you prefer to create a virtual environment manually, use the following command in the terminal, where `.venv` is the name of the environment folder:

- On Windows:

    ```
    python -m venv .venv` or `py -3 -m venv .venv
    ```

- On macOS/Linux:
    > **Note**: You may need to install the `python3-venv` package first on Debian-based systems using `sudo apt-get install python3-venv`.


    ```
    python3 -m venv .venv
    ```



## 3. Activate the virtual environment:
- On Windows:
  ```
  .venv\Scripts\activate
  ```
- On macOS and Linux:
  ```
  source .venv/bin/activate
  ```

## 4. Install the required packages:

   ```
  pip install -r requirements.txt
  ```

## 5. Create the `.env` file:
Create a `.env` file in the project root directory with your Azure OpenAI credentials:

```
AZURE_OPENAI_API_KEY=your_api_key_here
AZURE_OPENAI_ENDPOINT=your_endpoint_here
```

# Usage

**Starting the application**:
- After the virtual environment is activated and the required packages are installed, you type this in the terminal:

```
python app.py
```

In the terminal will be a localhost link. Click it or copy it.  

Upload a PDF document and start interacting with the AI assistant by asking it to:

 `Provide PO Number, Title, Sup. Doc. No, Sup. Rev. No, Rev.Date, TagNo, Package, Equipment `. 
 
 There is an example PDF called `example.pdf` that you can use.

## Project Structure

- `app.py`: Main Flask application file
- `assistant_utils.py`: Azure OpenAI integration and assistant setup
- `pdf_utils.py`: PDF text extraction utilities
- `static/`: Directory for static files (CSS, JavaScript)
- `templates/`: HTML templates for the web interface
- `requirements.txt`: List of Python package dependencies

## Customization

- Modify the `INSTRUCTIONS` in `assistant_utils.py` to change the AI assistant's behavior.
- Adjust the UI by editing the HTML templates in the `templates/` directory and the CSS in `static/styles.css`.

## Troubleshooting

- If you encounter "No response from the assistant" errors, check your Azure OpenAI API key and endpoint in the `.env` file. It could also be due to the request rate being to low, change that in the deployment setting of your model in azure. 
- Ensure that your Azure OpenAI service has enough capacity to handle the requests.
- Check the console logs for any Python errors or JavaScript console errors in the browser.

