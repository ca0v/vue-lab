from datetime import *


def ticks_to_python(ticks: int):
    return datetime.utcfromtimestamp(ticks/1000)


def date_to_python(date: str):
    return datetime.strptime(date, '%Y-%m-%d')  # .date()


def python_to_date(date: date):
    return date.strftime('%Y-%m-%d')


def python_to_ticks(date: date):
    dt = datetime.combine(date, datetime.min.time())
    return int(dt.timestamp() * 1000)
