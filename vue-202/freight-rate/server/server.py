# use flask to server static files from the current directory
# and serve the index.html file for all other requests
import os
from flask import Flask, send_from_directory
app = Flask(__name__, static_folder='../dist', static_url_path='')


@app.route('/<path:path>')
def static_proxy(path):
    print('static_proxy')
    return send_from_directory('.', path)


if __name__ == '__main__':
    app.run(debug=True)
