# app.py
from flask import Flask, render_template, request, jsonify, send_file
from pdf_utils import extract_text_from_pdf
from assistant_utils import chat_with_assistant
import os
import csv
from io import StringIO

app = Flask(__name__)

def parse_csv_response(response):
    # Remove the ```csv and ``` markers
    csv_content = response.replace('```csv', '').replace('```', '').strip()
    
    # Use StringIO to treat the string as a file
    csv_file = StringIO(csv_content)
    
    # Read the CSV content
    csv_reader = csv.reader(csv_file)
    
    # Convert to list of lists
    data = [row for row in csv_reader if row]  # Skip empty rows
    
    return data

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        if 'file' not in request.files:
            return jsonify({'error': 'Please Upload a File'})
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'})
        if file and file.filename.endswith('.pdf'):
            # Save the file temporarily
            temp_path = 'temp.pdf'
            file.save(temp_path)
            
            # Extract text from PDF
            scraped_text = extract_text_from_pdf(temp_path)
            
            # Remove the temporary file
            os.remove(temp_path)
            
            # Get user input
            user_input = request.form['user_input']
            
            # Prepare context and get response from assistant
            context = f"The following is the content of a PDF document:\n\n{scraped_text}\n\nPlease answer questions or perform tasks based on this content."
            response = chat_with_assistant(user_input, context)
            
            # Parse the CSV response
            csv_data = parse_csv_response(response)
            
            # Save CSV data to a temporary file
            temp_csv_path = 'temp_response.csv'
            with open(temp_csv_path, 'w', newline='') as f:
                csv_writer = csv.writer(f)
                csv_writer.writerows(csv_data)
            
            return jsonify({'response': response, 'csv_available': True})
    return render_template('index.html')

@app.route('/download_csv')
def download_csv():
    return send_file('temp_response.csv', as_attachment=True, download_name='response.csv')

if __name__ == '__main__':
    app.run(debug=True)