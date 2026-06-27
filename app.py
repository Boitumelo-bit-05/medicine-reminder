from http.server import HTTPServer, SimpleHTTPRequestHandler
import json
import os
from datetime import datetime

class MedicineHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            with open('templates/index.html', 'r') as f:
                self.wfile.write(f.read().encode())
        elif self.path == '/api/medicines':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            with open('medicines.json', 'r') as f:
                data = json.load(f)
                self.wfile.write(json.dumps(data['medicines']).encode())
        elif self.path.startswith('/static/'):
            filepath = self.path[1:]
            if os.path.exists(filepath):
                self.send_response(200)
                if filepath.endswith('.css'):
                    self.send_header('Content-type', 'text/css')
                elif filepath.endswith('.js'):
                    self.send_header('Content-type', 'application/javascript')
                self.end_headers()
                with open(filepath, 'rb') as f:
                    self.wfile.write(f.read())
            else:
                self.send_response(404)
                self.end_headers()
        else:
            self.send_response(404)
            self.end_headers()
    
    def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            
            if self.path == '/api/medicines':
                medicines = json.loads(body.decode())
                
                # Validate medicine data
                for med in medicines:
                    if not med.get('name') or not med.get('time'):
                        raise ValueError("Medicine must have name and time")
                
                with open('medicines.json', 'r') as f:
                    data = json.load(f)
                data['medicines'] = medicines
                with open('medicines.json', 'w') as f:
                    json.dump(data, f, indent=2)
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"success": True}).encode())
            
            elif self.path == '/api/confirm-medicine':
                data = json.loads(body.decode())
                med_name = data.get('name')
                
                if not med_name:
                    raise ValueError("Medicine name required")
                
                # Log confirmation (in real app, save to database)
                print(f"✓ {med_name} taken at {datetime.now().strftime('%H:%M:%S')}")
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"success": True, "message": f"Recorded: {med_name} taken"}).encode())
        
        except json.JSONDecodeError:
            self.send_response(400)
            self.end_headers()
            self.wfile.write(b'Invalid JSON')
        except ValueError as e:
            self.send_response(400)
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode().encode())
        except Exception as e:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Server error"}).encode())

if __name__ == '__main__':
    server = HTTPServer(('localhost', 8000), MedicineHandler)
    print('Medicine Reminder App running on http://localhost:8000')
    server.serve_forever()