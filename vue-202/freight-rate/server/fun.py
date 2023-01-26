from datetime import *


def unix_to_date(unix: int):
    return datetime.utcfromtimestamp(unix).strftime('%Y-%m-%d')


def date_to_unix(date: str):
    result = datetime.strptime(date, '%Y-%m-%d').timestamp()
    # remove timezone offset
    tzOffset = datetime.now().timestamp() - datetime.utcnow().timestamp()
    result += tzOffset
    # round to the nearest second
    result = round(result)
    return result


def ticks_to_python(ticks: int):
    return datetime.utcfromtimestamp(ticks/1000)


def date_to_python(date: str):
    return datetime.strptime(date, '%Y-%m-%d')  # .date()


def python_to_date(date: date):
    return date.strftime('%Y-%m-%d')


def python_to_ticks(date: date):
    return unix_to_ticks(date_to_unix(python_to_date(date)))


def ticks_to_unix(ticks: int):
    # floor to the nearest second
    return ticks//1000


def unix_to_ticks(unix):
    return int(unix*1000)
