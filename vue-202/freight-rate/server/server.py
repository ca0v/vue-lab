# use flask to server static files from the current directory
# and serve the index.html file for all other requests
from dataclasses import dataclass
from datetime import *
from dateutil.relativedelta import *
from flask import Flask, send_from_directory, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_restful import Api

app = Flask(__name__, static_folder='../dist', static_url_path='')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.sqlite'

api = Api(app)
db = SQLAlchemy(app)


@dataclass
class FreightRate(db.Model):
    __tablename__ = 'FreightRate'
    start_date: int
    end_date: int
    offload_rate: float
    port1_rate: float
    port2_rate: float

    start_date = db.Column(db.Integer, primary_key=True)
    end_date = db.Column(db.Integer)
    offload_rate = db.Column(db.Float)
    port1_rate = db.Column(db.Float)
    port2_rate = db.Column(db.Float)

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


def unix_to_date(unix):
    return datetime.utcfromtimestamp(unix).strftime('%Y-%m-%d')


@app.route('/api/rates/<path:start>/<path:end>', methods=['GET'])
def get_rates(start: int, end: int):
    # convert to unix time
    print('get_rates', start, end)
    start = datetime.strptime(start, '%Y-%m-%d').timestamp()
    end = datetime.strptime(end, '%Y-%m-%d').timestamp()
    print('get_rates', start, end)

    rates = FreightRate.query.filter(
        FreightRate.start_date >= start, FreightRate.start_date < end).all()

    return jsonify([rate.__dict__ for rate in rates])

# http put function to update rates


@app.route("/api/rates/<start_date>", methods=['PUT'])
def update_rate(start_date: int):
    print('update_rate', start_date)

    rate = FreightRate.query.filter_by(start_date=start_date).first()
    if rate is None:
        return app.response_class(
            response=jsonify({'error': 'not found'}),
            status=404,
            mimetype='application/json'
        )

    # read request as a FreightRate object
    changes = request.get_json()
    changes = as_rate(changes)

    # update the rate with the changes
    rate.start_date = changes.start_date
    rate.end_date = changes.end_date
    rate.offload_rate = changes.offload_rate
    rate.port1_rate = changes.port1_rate
    rate.port2_rate = changes.port2_rate

    # update the rate data (will this work if the start_date changes?)
    db.session.merge(rate)
    db.session.commit()

    # read the updated rate from the database
    rate = FreightRate.query.filter_by(start_date=start_date).first()
    return jsonify(rate)


# http post to add a new rate


@app.route("/api/rates", methods=['POST'])
def add_rate():
    rateRequest = request.get_json()
    print('add_rate', rateRequest)

    # convert rateRequest to a FreightRate object
    rate = as_rate(rateRequest)
    print('add_rate', rate)

    # add the new rate
    db.session.add(rate)
    db.session.commit()

    # return the new rate
    rate = FreightRate.query.filter_by(start_date=rate.start_date).first()

    # convert to json
    return jsonify(rate)


# http delete to remove a rate


@app.route("/api/rates/<start_date>", methods=['DELETE'])
def delete_rate(start_date: int):
    print('delete_rate', start_date)

    # delete the rate
    rate = FreightRate.query.filter_by(start_date=start_date).first()
    db.session.delete(rate)
    db.session.commit()

    # return the deleted rate
    return jsonify(rate)


def as_rate(rateRequest):
    rate = FreightRate()
    rate.start_date = rateRequest['start_date']
    rate.end_date = rateRequest['end_date']
    rate.offload_rate = rateRequest['offload_rate']
    rate.port1_rate = rateRequest['port_rates'][0]["rate"]
    rate.port2_rate = rateRequest['port_rates'][1]["rate"]
    return rate


with app.app_context():
    db.create_all()

############################################
# waitress-serve --port=5500 --call 'server:create_app'
# or python3 server.py
# or flask --app server.py --debug run
############################################


def create_app():
    return app


if __name__ == '__main__':
    # start the server
    create_app().run(debug=True, host='localhost', port=5000)
