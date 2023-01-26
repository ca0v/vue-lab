# use flask to server static files from the current directory
# and serve the index.html file for all other requests
from asyncio import Lock
import jsonpickle
from dataclasses import dataclass
from datetime import *
from dateutil.relativedelta import *
from flask import Flask, send_from_directory, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_restful import Api
from flask_cors import CORS
from sqlalchemy import func

from fun import date_to_unix, ticks_to_unix, unix_to_date, unix_to_ticks

app = Flask(__name__, static_folder='./dist', static_url_path='')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.sqlite'

api = Api(app)
db = SQLAlchemy(app)

MAX_DATE = "2100-12-31"


@dataclass
class FreightRate(db.Model):
    __tablename__ = 'FreightRate'

    pk: int
    start_date: int
    end_date: int
    offload_rate: float
    port1_rate: float
    port2_rate: float

    pk = db.Column(db.Integer)
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
def static_proxy(path: str):
    print('static_proxy')
    return send_from_directory('.', path)


# get the last n rates sorted by start_date descending


@app.route('/aiq/api/rates/reset/<int:step_size>', methods=['GET'])
def reset_rates(step_size: int):
    # delete all rates
    db.session.query(FreightRate).delete()
    # insert a rate for each month from 2020-01-01 to 2023-01-01
    start_date = date_to_unix('2020-01-01')
    cutoff_date = date_to_unix('2023-12-31')
    pennies = 0.01

    pk = 0
    while start_date < cutoff_date:
        pk += 1
        # add a month to the start_date
        rate = FreightRate(pk=pk, start_date=start_date, end_date=add_day(start_date, step_size-1),
                           offload_rate=789+pennies, port1_rate=1100.99, port2_rate=1300.01)
        pennies += 0.01
        db.session.add(rate)
        start_date = add_day(start_date, step_size)

    rate = FreightRate(pk=pk+1, start_date=start_date, end_date=date_to_unix(MAX_DATE),
                       offload_rate=1000, port1_rate=1100, port2_rate=1200)
    db.session.add(rate)
    db.session.commit()

    # return the entire dataset
    return get_last_n_rates(1000)


@app.route('/aiq/api/rate/<int:pk>', methods=['GET'])
def get_rate(pk: int):
    print('get_rate', pk)
    rate = FreightRate.query.filter_by(pk=pk).first()
    rate.start_date = unix_to_ticks(rate.start_date)
    rate.end_date = unix_to_ticks(rate.end_date)
    return jsonify(rate)


@app.route('/aiq/api/rates/<int:n>', methods=['GET'])
def get_last_n_rates(n: int):
    print('get_last_n_rates', n)
    rates = FreightRate.query.order_by(
        FreightRate.start_date.desc()).limit(n).all()
    # convert to ticks
    for rate in rates:
        rate.start_date = unix_to_ticks(rate.start_date)
        rate.end_date = unix_to_ticks(rate.end_date)
    return jsonify(rates)


@app.route('/aiq/api/rates/<path:start_date>/<int:n>', methods=['GET'])
def get_rates(start_date: str, n: int):
    print('get_rates', start_date, n)

    # convert to unix time
    start_date = date_to_unix(start_date)
    print('get_rates', unix_to_date(start_date), n)

    rates = FreightRate.query.order_by(FreightRate.start_date.desc()).filter(
        FreightRate.start_date <= start_date)

    # just the last n rates
    rates = rates.limit(n).all()

    # convert to ticks
    for rate in rates:
        rate.start_date = unix_to_ticks(rate.start_date)
        rate.end_date = unix_to_ticks(rate.end_date)

    return jsonify(rates)

# http put function to update rates


@app.route("/aiq/api/rates/<int:pk>", methods=['PUT'])
def update_rate(pk: int):
    print('update_rate', pk)

    diffgram = {
        'deletes': [],
        'updates': [],
        'inserts': []
    }

    db.session.begin()
    try:
        # find the rate
        rate = FreightRate.query.filter_by(pk=pk).first()
        if rate is None:
            return jsonify({'error': 'rate not found'}), 404

        start_date = rate.start_date

        # read request as a FreightRate object
        changes = request.get_json()
        changes = as_rate(changes)

        # did the start_date change?
        new_start_date = ticks_to_unix(changes.start_date)
        if new_start_date != start_date:
            print('start_date changed', unix_to_date(
                start_date), unix_to_date(new_start_date))

            diffgram['deletes'].append(pk)
            # find the previous rate and adjust its end_date
            previous = FreightRate.query.order_by(FreightRate.start_date.desc()).filter(
                FreightRate.start_date < start_date).first()
            if previous is not None:
                print('previous rate found', unix_to_date(
                    previous.start_date), "diff", previous.start_date - start_date)
                previous.end_date = add_day(new_start_date, -1)
                db.session.merge(previous)
                diffgram['updates'].append(previous.pk)
            # find the next rate and adjust our end_date
            next = FreightRate.query.order_by(FreightRate.start_date).filter(
                FreightRate.start_date > start_date).first()
            if next is not None:
                print('next rate found', unix_to_date(next.start_date))
                rate.end_date = add_day(next.start_date, -1)
                db.session.merge(next)
            # update the rate data (will this work if the start_date changes?)
        # update the rate with the changes (this performs database changes!)
        rate.start_date = ticks_to_unix(changes.start_date)
        rate.offload_rate = changes.offload_rate
        rate.port1_rate = changes.port1_rate
        rate.port2_rate = changes.port2_rate
        db.session.merge(rate)  # redundant?
        diffgram['updates'].append(rate.pk)

    except Exception as e:
        print(e)
        db.session.rollback()
        # convert error to a string
        e = str(e)
        # return the error
        return jsonify({'error': e}), 500
    else:
        db.session.commit()

    return prepare_diffgram(diffgram)


# http post to add a new rate

# lock = Lock()


@app.route("/aiq/api/rates", methods=['POST'])
def insert_rate():
    # how to create an access lock to prevent multiple clients from inserting at the same time
    print('enter insert_rate')
    # convert rateRequest to a FreightRate object
    rate = as_rate(request.get_json())
    result = unsafe_insert_rate(rate)
    print('exit insert_rate')
    return result


def unsafe_insert_rate(rate: FreightRate):

    # convert to unix time
    rate.start_date = ticks_to_unix(rate.start_date)
    rate.end_date = ticks_to_unix(rate.end_date)

    # make sure the row does not already exist
    existing = FreightRate.query.filter_by(start_date=rate.start_date).first()
    if existing is not None:
        print('rate already exists', unix_to_date(rate.start_date))
        # return 404
        return jsonify({'error': 'rate already exists'}), 404

    # get the max rowid
    max_rowid = db.session.query(func.max(FreightRate.pk)).scalar()
    db.session.commit()

    # if there are no rows in the table then max_rowid will be 0
    if max_rowid is None:
        max_rowid = 0

    print('max_rowid', max_rowid)

    rate.pk = max_rowid + 1

    diffgram = {
        'deletes': [],
        'updates': [],
        'inserts': []
    }

    db.session.begin()
    try:
        # if the start date in within the range of an existing rate
        # then the existing rate must be modified by moving the end date back

        # search for a rate overlap
        overlap = FreightRate.query.filter(
            FreightRate.start_date <= rate.start_date,
            FreightRate.end_date > rate.start_date).first()

        # if there is an overlap
        if overlap is not None:
            print('overlap found, moving its end date before the new start date, setting new end date to the existing end date')
            # preserve end date of the existing rate
            rate.end_date = overlap.end_date
            overlap.end_date = add_day(rate.start_date, -1)
            # update the rate data
            db.session.merge(overlap)
            diffgram['updates'].append(overlap.pk)
        else:
            # find the rate this comes before and update its end date
            previous = FreightRate.query.order_by(FreightRate.start_date.desc()).filter(
                FreightRate.start_date < rate.start_date).first()
            if previous is not None:
                print('updating the previous end date')
                previous.end_date = add_day(rate.start_date, -1)
                db.session.merge(previous)
                diffgram['updates'].append(previous.pk)

            # find the rate that comes after to compute an end date
            next = FreightRate.query.order_by(FreightRate.start_date).filter(
                FreightRate.start_date > rate.start_date).first()
            if next is not None:
                print('using next start date to compute end date: ' +
                      unix_to_date(next.start_date))
                rate.end_date = add_day(next.start_date, -1)
            else:
                print('no end_date')
                rate.end_date = date_to_unix(MAX_DATE)

        # add the new rate
        db.session.add(rate)
        diffgram['inserts'].append(rate.pk)
    except Exception as e:
        print("failed to insert", e)
        db.session.rollback()
        # return the error
        return jsonify({'error': "failed to insert"}), 409
    else:
        db.session.commit()

    return prepare_diffgram(diffgram)


# http delete to remove a rate


@app.route("/aiq/api/rates/<int:pk>", methods=['DELETE'])
def delete_rate(pk: int):
    print('delete_rate', pk)

    diffgram = {
        'deletes': [],
        'updates': [],
        'inserts': []
    }

    # begin a transaction
    db.session.begin()
    try:

        # a date gap cannot form if the rate is deleted
        # so the future rates must be moved back or the past rates must be moved forward
        # future takes precedence
        rate = FreightRate.query.filter_by(pk=pk).first()
        if rate is None:
            return jsonify({'error': 'not found'}), 404

        start_date = rate.start_date
        # delete the rate
        db.session.delete(rate)
        diffgram['deletes'].append(pk)

        # find the future rate
        future_rate = FreightRate.query.order_by(FreightRate.start_date.asc()).filter(
            FreightRate.start_date > start_date).limit(1).first()
        if future_rate is not None:
            # move the future rate back
            future_rate.start_date = start_date
            db.session.merge(future_rate)
            diffgram['updates'].append(future_rate.pk)
        else:
            # find the past rate
            past_rate = FreightRate.query.order_by(FreightRate.start_date.desc()).filter(
                FreightRate.start_date < start_date).limit(1).first()
            if past_rate is not None:
                # move the past rate forward
                past_rate.end_date = rate.end_date
                db.session.merge(past_rate)
                diffgram['updates'].append(past_rate.pk)
    except Exception as e:
        print(e)
        db.session.rollback()
        # return the error
        jsonify({'error': e}), 500
    else:
        db.session.commit()

    # convert to ticks
    return prepare_diffgram(diffgram)


def prepare_diffgram(diffgram):
    return jsonpickle.encode(diffgram)


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
