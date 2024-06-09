import http.server
# import ssl
# import os

# Define the handler to serve files from the current directory
# class SimpleHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    # def end_headers(self):
        # self.send_header('Cache-Control', 'no-store')
        # super().end_headers()

##Define the server address and port
# server_address = ('', 8000)

##Create the HTTP server and bind it to the server address
# httpd = http.server.HTTPServer(server_address, SimpleHTTPRequestHandler)

# Wrap the server socket with SSL
# httpd.socket = ssl.wrap_socket(httpd.socket,
                               # keyfile='server.key',
                               # certfile='server.crt',
                               # server_side=True)



import socketserver

PORT = 8080

class HttpRequestHandler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {
        '': 'application/octet-stream',
        '.manifest': 'text/cache-manifest',
        '.html': 'text/html',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.svg':	'image/svg+xml',
        '.css':	'text/css',
        '.js':'application/x-javascript',
        '.wasm': 'application/wasm',
        '.json': 'application/json',
        '.xml': 'application/xml',
    }
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

httpd = socketserver.TCPServer(("localhost", PORT), HttpRequestHandler)

try:
    print(f"serving at http://localhost:{PORT}")
    httpd.serve_forever()
except KeyboardInterrupt:
    pass