# use flask to server static files from the current directory
# and serve the index.html file for all other requests
import os
import sys
from flask import Flask, send_from_directory
app = Flask(__name__, static_folder='../dist', static_url_path='')


@app.route('/<path:path>')
def static_proxy(path):
    print('static_proxy')
    return send_from_directory('.', path)


if __name__ == '__main__':
    # if "live" is passed as an argument, serve on 0.0.0.0:5000
    # otherwise, serve on localhost:5000
    host = 'localhost'
    debug = True
    port = 5000
    if len(sys.argv) > 1 and sys.argv[1] == "live":
        host = '0.0.0.0'
        debug = False

    if len(sys.argv) > 2:
        port = int(sys.argv[2])

    app.run(host=host, port=port, debug=debug)
