from flask import Flask, render_template, request, jsonify, send_file, session, Response
from pdf_utils import extract_text_from_pdf
from assistant_utils import chat_with_assistant
import os
import csv
from io import StringIO

app = Flask(__name__)
app.secret_key = os.urandom(24)  # Generate a random secret key

def parse_csv_response(response):
    # Remove triple backticks and strip whitespace
    csv_content = response.replace('```', '').strip()
    
    # Remove 'csv' from the start if it exists
    if csv_content.lower().startswith('csv'):
        csv_content = csv_content[3:].lstrip()  # Remove 'csv' and any following whitespace
    
    csv_file = StringIO(csv_content)
    csv_reader = csv.reader(csv_file)
    data = [row for row in csv_reader if row]
    return data

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        user_input = request.form['user_input']
        
        if 'file' in request.files:
            file = request.files['file']
            if file and file.filename.endswith('.pdf'):
                temp_path = 'temp.pdf'
                file.save(temp_path)
                scraped_text = extract_text_from_pdf(temp_path)
                os.remove(temp_path)
                session['context'] = f"The following is the content of a PDF document:\n\n{scraped_text}\n\nPlease answer questions or perform tasks based on this content."
        
        context = session.get('context', '')
        if not context and 'file' not in request.files:
            return jsonify({'error': 'Please upload a file for the first message'})
        
        response = chat_with_assistant(user_input, context)
        
        # Parse the response to check if it contains CSV data
        csv_data = parse_csv_response(response)
        if csv_data:
            # Store CSV data in session for later download
            session['csv_data'] = csv_data
            csv_available = True
        else:
            csv_available = False
        
        return jsonify({'response': response, 'csv_available': csv_available})
    
    return render_template('index.html')

@app.route('/download_csv')
def download_csv():
    csv_data = session.get('csv_data')
    if not csv_data:
        return "No CSV data available", 404
    
    output = StringIO()
    writer = csv.writer(output)
    writer.writerows(csv_data)
    
    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={"Content-disposition": "attachment; filename=response.csv"}
    )

if __name__ == '__main__':
    app.run(debug=True)