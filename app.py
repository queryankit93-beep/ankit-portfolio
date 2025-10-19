from flask import Flask, render_template, send_from_directory, jsonify, request, send_file
import os
import json
from datetime import datetime
import base64

app = Flask(__name__)

# Ensure data directory exists
if not os.path.exists('data'):
    os.makedirs('data')

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/login')
def login():
    return send_from_directory('.', 'login.html')

@app.route('/dashboard')
def dashboard():
    return send_from_directory('.', 'dashboard.html')

@app.route('/recruiter-view')
def recruiter_view():
    return send_from_directory('.', 'recruiter-view.html')

# Serve static files
@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('.', filename)

# API endpoint to check login
@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    # Default credentials
    if username == 'admin' and password == 'password123':
        return jsonify({'success': True, 'message': 'Login successful'})
    else:
        return jsonify({'success': False, 'message': 'Invalid credentials'})

# API endpoint to get portfolio data
@app.route('/api/portfolio-data')
def get_portfolio_data():
    try:
        if os.path.exists('data/portfolio_data.json'):
            with open('data/portfolio_data.json', 'r') as f:
                data = json.load(f)
            return jsonify(data)
        else:
            # Return default data structure
            default_data = {
                "profile": {
                    "name": "Ankit Kumar Singh",
                    "title": "Full Stack Developer",
                    "bio": "Passionate developer with 1+ years of experience building web applications. Specialized in JavaScript, React, and Node.js. Always eager to learn new technologies and tackle challenging problems.",
                    "email": "singhkumar50866@gmail.com",
                    "phone": "+91 9155892986",
                    "linkedin": "www.linkedin.com/in/ankit-kumar-54658b34b",
                    "github": "https://github.com/Dada09898",
                    "website": "https://ankitkumar.dev",
                    "profileImage": None
                },
                "settings": {
                    "theme": 'light',
                    "language": 'en',
                    "whatsappNumber": '+919155892986',
                    "whatsappEnabled": True,
                    "chatbotEnabled": True
                },
                "skills": ['JavaScript', 'React', 'Node.js', 'Python', 'MongoDB', 'AWS', 'Docker'],
                "experience": [
                    {
                        "id": 1,
                        "title": 'Senior Developer',
                        "company": 'Tech Solutions Inc.',
                        "startDate": '2020-01',
                        "endDate": None,
                        "current": True,
                        "description": 'Led a team of 5 developers in building scalable web applications. Implemented CI/CD pipelines reducing deployment time by 40%.'
                    },
                    {
                        "id": 2,
                        "title": 'Web Developer',
                        "company": 'Digital Creations',
                        "startDate": '2018-06',
                        "endDate": '2020-01',
                        "current": False,
                        "description": 'Developed and maintained client websites using React and Node.js. Improved site performance by 30% through optimization techniques.'
                    }
                ],
                "education": [
                    {
                        "id": 1,
                        "degree": 'Bachelor of Science in Computer Science',
                        "institution": 'University of Technology',
                        "startDate": '2014-09',
                        "endDate": '2018-06',
                        "current": False,
                        "description": 'Graduated with honors. Focused on software engineering and web technologies.'
                    }
                ],
                "certificates": [
                    {
                        "id": 1,
                        "name": 'AWS Certified Developer',
                        "organization": 'Amazon Web Services',
                        "image": '/assets/images/certificates/aws-certificate.jpg'
                    },
                    {
                        "id": 2,
                        "name": 'React Advanced Concepts',
                        "organization": 'React Training',
                        "image": '/assets/images/certificates/react-certificate.jpg'
                    }
                ],
                "projects": [
                    {
                        "id": 1,
                        "title": "E-Commerce Platform",
                        "description": "Full-stack e-commerce solution with React, Node.js, and MongoDB",
                        "image": "/assets/images/projects/ecommerce.jpg",
                        "technologies": ["React", "Node.js", "MongoDB", "Stripe"],
                        "github": "https://github.com/ankitkumar/ecommerce",
                        "live": "https://ecommerce-demo.com",
                        "featured": True
                    }
                ],
                "stats": {
                    "resumes": 3,
                    "images": 12,
                    "certificates": 7,
                    "profileViews": 1243
                }
            }
            return jsonify(default_data)
    except Exception as e:
        print(f"Error loading portfolio data: {e}")
        return jsonify({"error": str(e)}), 500

# API endpoint to save portfolio data
@app.route('/api/save-data', methods=['POST'])
def save_portfolio_data():
    try:
        data = request.get_json()
        
        # Ensure data directory exists
        if not os.path.exists('data'):
            os.makedirs('data')
            
        with open('data/portfolio_data.json', 'w') as f:
            json.dump(data, f, indent=2)
        return jsonify({'success': True, 'message': 'Data saved successfully'})
    except Exception as e:
        print(f"Error saving data: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

# API endpoint to handle image uploads
@app.route('/api/upload-image', methods=['POST'])
def upload_image():
    try:
        if 'image' not in request.files:
            return jsonify({'success': False, 'message': 'No image file'})
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'success': False, 'message': 'No selected file'})
        
        # Create directories if they don't exist
        os.makedirs('assets/images/profile', exist_ok=True)
        os.makedirs('assets/images/certificates', exist_ok=True)
        os.makedirs('assets/images/projects', exist_ok=True)
        
        # Save the file
        filename = f"profile_{int(datetime.now().timestamp())}.jpg"
        filepath = os.path.join('assets', 'images', 'profile', filename)
        file.save(filepath)
        
        return jsonify({
            'success': True, 
            'message': 'Image uploaded successfully',
            'filepath': f'/assets/images/profile/{filename}'
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# API endpoint to download resume
@app.route('/api/download-resume')
def download_resume():
    try:
        # For now, return a sample PDF
        # In production, you would serve the actual resume file
        return send_file('sample-resume.pdf', as_attachment=True)
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/increment-stats', methods=['POST'])
def increment_stats():
    try:
        data = request.get_json()
        stat_type = data.get('type')  # 'profileViews' or 'resumes'
        
        # Load current data
        if os.path.exists('data/portfolio_data.json'):
            with open('data/portfolio_data.json', 'r') as f:
                portfolio_data = json.load(f)
            
            # Increment the stat
            if stat_type in portfolio_data.get('stats', {}):
                portfolio_data['stats'][stat_type] += 1
                
                # Save updated data
                with open('data/portfolio_data.json', 'w') as f:
                    json.dump(portfolio_data, f, indent=2)
        
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
    

# === ADD THIS CODE TO app.py ===
# Place it AFTER line 129 (after @app.route('/api/increment-stats')) 
# and BEFORE line 135 (if __name__ == '__main__':)

@app.route('/api/upload-file', methods=['POST'])
def upload_file():
    """Handle file uploads for certificates, projects, etc."""
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'message': 'No file provided'})
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'success': False, 'message': 'No file selected'})
        
        # Determine file type from upload type parameter
        upload_type = request.form.get('type', 'general')
        
        # Create appropriate directory
        if upload_type == 'certificate':
            os.makedirs('assets/images/certificates', exist_ok=True)
            filename = f"certificate_{int(datetime.now().timestamp())}_{file.filename}"
            filepath = os.path.join('assets', 'images', 'certificates', filename)
        elif upload_type == 'project':
            os.makedirs('assets/images/projects', exist_ok=True)
            filename = f"project_{int(datetime.now().timestamp())}_{file.filename}"
            filepath = os.path.join('assets', 'images', 'projects', filename)
        elif upload_type == 'resume':
            os.makedirs('assets/documents', exist_ok=True)
            filename = f"resume_{int(datetime.now().timestamp())}_{file.filename}"
            filepath = os.path.join('assets', 'documents', filename)
        else:
            os.makedirs('assets/uploads', exist_ok=True)
            filename = f"upload_{int(datetime.now().timestamp())}_{file.filename}"
            filepath = os.path.join('assets', 'uploads', filename)
        
        # Save the file
        file.save(filepath)
        
        return jsonify({
            'success': True, 
            'message': 'File uploaded successfully',
            'filename': filename,
            'filepath': f'/{filepath}',
            'type': upload_type
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/delete-file', methods=['POST'])
def delete_file():
    """Handle file deletion"""
    try:
        data = request.get_json()
        filepath = data.get('filepath')
        
        if filepath and os.path.exists(filepath.lstrip('/')):
            os.remove(filepath.lstrip('/'))
            return jsonify({'success': True, 'message': 'File deleted successfully'})
        else:
            return jsonify({'success': False, 'message': 'File not found'})
            
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


if __name__ == '__main__':
    print("🚀 Starting Portfolio Application...")
    print("📍 Access your portfolio at: http://localhost:5000")
    print("🔐 Admin login at: http://localhost:5000/login")
    print("📊 Dashboard at: http://localhost:5000/dashboard")
    print("👔 Recruiter view at: http://localhost:5000/recruiter-view")
    print("\n📝 Default Login Credentials:")
    print("   Username: admin")
    print("   Password: password123")
    print("\n⏹️  Press Ctrl+C to stop the server")
    
    # Create necessary directories
    os.makedirs('data', exist_ok=True)
    os.makedirs('assets/images/profile', exist_ok=True)
    os.makedirs('assets/images/certificates', exist_ok=True)
    os.makedirs('assets/images/projects', exist_ok=True)
    
    app.run(debug=True, host='0.0.0.0', port=5000)