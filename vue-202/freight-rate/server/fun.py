from datetime import *


def date_to_python(date: str):
    return datetime.strptime(date, '%Y-%m-%d').date()


def python_to_date(date: date):
    return date.strftime('%Y-%m-%d')


def ticks_to_python(ticks: int):
    # ignore daylight savings
    return datetime.utcfromtimestamp(ticks//1000).date()


def python_to_ticks(date: date):
    date = datetime.combine(date, time())
    seconds = date.timestamp()
    offset = datetime.utcfromtimestamp(seconds).timestamp() - seconds
    print("python_to_ticks", date, seconds, offset)
    return int((seconds - offset) * 1000)
