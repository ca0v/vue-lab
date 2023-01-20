# use flask to server static files
from flask import Flask, send_from_directory

app = Flask(__name__, static_url_path='')


@app.route('/<path:path>')
def send_js(path):
    return send_from_directory('../dist/', path)

# send index.html as a response


@app.route('/')
def index():
    return send_from_directory('../dist', 'index.html')


if __name__ == '__main__':
    app.run()
