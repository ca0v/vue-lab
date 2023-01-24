# use flask to server static files from the current directory
# and serve the index.html file for all other requests
from dataclasses import dataclass
from datetime import *
from dateutil.relativedelta import *
from flask import Flask, send_from_directory, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_restful import Api
from flask_cors import CORS

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
CORS(app, supports_credentials=True)


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


# get the last n rates sorted by start_date descending


@app.route('/api/rates/<int:n>', methods=['GET'])
def get_last_n_rates(n: int):
    print('get_last_n_rates', n)
    rates = FreightRate.query.order_by(
        FreightRate.start_date.desc()).limit(n).all()
    return jsonify(rates)


@app.route('/api/rates/<path:start>/<path:end>', methods=['GET'])
def get_rates(start: int, end: int):
    # convert to unix time
    print('get_rates', start, end)
    start = datetime.strptime(start, '%Y-%m-%d').timestamp()
    end = datetime.strptime(end, '%Y-%m-%d').timestamp()
    print('get_rates', start, end)

    rates = FreightRate.query.filter(
        FreightRate.start_date >= start, FreightRate.start_date < end).all()

    return jsonify(rates)

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

    db.session.commit() # after a select
    db.session.begin()
    try:
        # did the start_date change?
        if rate.start_date != start_date:
            # adjust the new end_date to the end_date of the overlapped rate
            # adjust the overlapped end_date to the day before the new start_date
            previous = FreightRate.query.order_by(FreightRate.start_date.desc()).filter(
                FreightRate.start_date < start_date).first()
            if previous is not None:
                rate.end_date = previous.end_date
                previous.end_date = add_day(rate.start_date, -1)
                db.session.merge(previous)
        # update the rate data (will this work if the start_date changes?)
        db.session.merge(rate)
    except Exception as e:
        print(e)
        db.session.rollback()
        # return the error
        return app.response_class(
            response=jsonify({'error': e}),
            status=500,
            mimetype='application/json'
        )
    else:
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

    db.session.begin()
    try:
        # add the new rate
        db.session.add(rate)

        # if the start date in within the range of an existing rate
        # then the existing rate must be modified by moving the end date back

        # search for a rate overlap
        overlap = FreightRate.query.filter(
            FreightRate.start_date <= rate.start_date,
            FreightRate.end_date > rate.start_date).first()

        # if there is an overlap
        if overlap is not None:
            # move the end date back
            overlap.end_date = add_day(rate.start_date, -1)
            # update the rate data
            db.session.merge(overlap)

    except Exception as e:
        print(e)
        db.session.rollback()
        # return the error
        return app.response_class(
            response=jsonify({'error': e}),
            status=500,
            mimetype='application/json'
        )
    else:
        db.session.commit()

    # return the new rate
    rate = FreightRate.query.filter_by(start_date=rate.start_date).first()

    # convert to json
    return jsonify(rate)


# http delete to remove a rate


@app.route("/api/rates/<start_date>", methods=['DELETE'])
def delete_rate(start_date: int):
    print('delete_rate', start_date)

    # begin a transaction
    db.session.begin()
    try:

        # a date gap cannot form if the rate is deleted
        # so the future rates must be moved back or the past rates must be moved forward
        # future takes precedence
        rate = FreightRate.query.filter_by(start_date=start_date).first()

        # delete the rate
        db.session.delete(rate)

        # find the future rate
        future_rate = FreightRate.query.order_by(FreightRate.start_date.asc()).filter(
            FreightRate.start_date > start_date).limit(1).first()
        if future_rate is not None:
            # move the future rate back
            future_rate.start_date = start_date
            db.session.merge(future_rate)

        else:
            # find the past rate
            past_rate = FreightRate.query.order_by(FreightRate.start_date.desc()).filter(
                FreightRate.start_date < start_date).limit(1).first()
            if past_rate is not None:
                # move the past rate forward
                past_rate.end_date = rate.end_date
                db.session.merge(past_rate)
    except Exception as e:
        print(e)
        db.session.rollback()
        # return the error
        return app.response_class(
            response=jsonify({'error': e}),
            status=500,
            mimetype='application/json'
        )
    else:
        db.session.commit()

    # return the deleted rate
    return jsonify(rate)


# add a day to a date
def add_day(date: int, days: int = 1):
    return date + days * (60 * 60 * 24)


def as_rate(rateRequest):
    rate = FreightRate()
    rate.start_date = rateRequest['start_date']
    rate.end_date = rateRequest['end_date']
    rate.offload_rate = rateRequest['offload_rate']
    rate.port1_rate = rateRequest['port1_rate']
    rate.port2_rate = rateRequest['port2_rate']
    return rate


with app.app_context():
    db.create_all()

############################################
# waitress-serve --port=3003 --call 'server:create_app'
# or python3 server.py
# or flask --app server.py --debug run
############################################


def create_app():
    return app


if __name__ == '__main__':
    # start the server
    create_app().run(debug=True, host='localhost', port=5000)
