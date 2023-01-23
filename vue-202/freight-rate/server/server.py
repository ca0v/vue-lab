# use flask to server static files from the current directory
# and serve the index.html file for all other requests
from datetime import *
from dateutil.relativedelta import *
import json
import os
import random
import sys
from flask import Flask, send_from_directory
app = Flask(__name__, static_folder='../dist', static_url_path='')

# open CORS to http://localhost:5173/
# this is the test app port


@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin',
                         'http://localhost:5173')
    response.headers.add('Access-Control-Allow-Headers',
                         'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    return response


@app.route('/<path:path>')
def static_proxy(path):
    print('static_proxy')
    return send_from_directory('.', path)


class FreightRate:
    def __init__(self, start_date, end_date, offload_rate, port_rates):
        self.start_date = start_date
        self.end_date = end_date
        self.offload_rate = offload_rate
        self.port_rates = port_rates


class PortRate:
    def __init__(self, port, rate):
        self.port = port
        self.rate = rate


samplePorts = ["LB", "NY"]

# function to convert a unix timestamp (zulu time) to a string in the format YYYY-MM-DD


def unix_to_date(unix):
    return datetime.utcfromtimestamp(unix).strftime('%Y-%m-%d')


@app.route('/api/rates/<start>/<end>')
def rates(start, end):
    print('rates')
    print('start', start)
    print('end', end)

    # convert the start date from yyyy-mm-dd to unix timestamp
    start = datetime.strptime(start, '%Y-%m-%d')
    end = datetime.strptime(end, '%Y-%m-%d')

    print('start', start)
    print('end', end)

    # generate a list of dates from start to end with 14 day intervals
    # this is a list of strings in the format YYYY-MM-DD
    start_date = start

    freight_rates = []
    while start_date < end:
        # days from today
        days = (start_date - datetime.now()).days

        # add time to the start_date
        next_start_date = start_date + relativedelta(months=1)
        end_date = next_start_date + relativedelta(days=-1)

        # generate rates for samplePorts
        port_rates = []
        for port in samplePorts:
            port_rates.append(PortRate(port, 1000 + random.random() * days))

        d1 = unix_to_date(start_date.timestamp())
        d2 = unix_to_date(end_date.timestamp())

        freight_rate = FreightRate(
            start_date=d1, end_date=d2, offload_rate=500 + days, port_rates=port_rates)

        freight_rates.append(freight_rate)
        start_date = next_start_date

    # sort the list of freight rates by start date (descending order)
    freight_rates.sort(key=lambda x: x.start_date, reverse=True)

    # remove dates before Jan 2020
    freight_rates = [x for x in freight_rates if x.start_date >= '2020-01-01']

    # convert freight_rates to json
    response = json.dumps(
        freight_rates, default=lambda o: o.__dict__, sort_keys=True, indent=4)

    # write a response header
    response = app.response_class(
        response=response,
        status=200,
        mimetype='application/json'
    )
    return response


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
