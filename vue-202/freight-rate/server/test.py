from datetime import *
import jsonpickle
import unittest

from fun import date_to_python, ticks_to_python, python_to_date, python_to_ticks


class TestIt(unittest.TestCase):
    def test_how_to_encode(self):
        data = [1, 2, 3]
        output = jsonpickle.encode(data)
        self.assertEqual(output, '[1, 2, 3]')

    def test_how_to_decode(self):
        data = '[1, 2, 3]'
        output = jsonpickle.decode(data)
        self.assertEqual(output, [1, 2, 3])

    def test_encode_simple_object(self):

        data = {
            "test": 1,
        }

        output = jsonpickle.encode(data)
        self.assertEqual(output, '{"test": 1}')

    def test_encode_complex_object(self):

        data = {
            "test": 1,
            "test2": {
                "test3": 2,
            }
        }

        output = jsonpickle.encode(data)
        self.assertEqual(output, '{"test": 1, "test2": {"test3": 2}}')

    def test_encode_diffgram_object(self):

        data = {
            "inserts": [1, 2, 3],
            "deletes": [4, 5, 6],
            "updates": [7, 8, 9],
        }

        output = jsonpickle.encode(data)
        self.assertEqual(
            output, '{"inserts": [1, 2, 3], "deletes": [4, 5, 6], "updates": [7, 8, 9]}')

    def test_encode_array(self):

        data = {
            "items": []
        }

        data["items"].append(1)

        output = jsonpickle.encode(data)
        self.assertEqual(output, '{"items": [1]}')


class TestDateConversion(unittest.TestCase):
    def test_python_time(self):
        self.assertEqual(datetime.strptime(
            '2023-10-31', '%Y-%m-%d').date().strftime('%Y-%m-%d'), '2023-10-31')

        python_date = datetime(1970, 1, 1, 0, 0, tzinfo=timezone.utc)
        ONE_DAY = 24 * 60 * 60

        self.assertEqual(python_date.timestamp(), 0)

        # convert to utc date
        python_date = datetime.combine(python_date, time()).date()

        self.assertEqual(python_to_date(python_date), '1970-01-01')
        self.assertEqual(date_to_python('1970-01-01'), python_date)

        self.assertEqual(python_to_ticks(python_date), 0)
        self.assertEqual(ticks_to_python(0), python_date)

        self.assertEqual(python_to_ticks(ticks_to_python(0)), 0)

        self.assertEqual(python_to_ticks(
            ticks_to_python(ONE_DAY * 1000)), ONE_DAY * 1000)

        # array from 1 to 1000
        for i in range(0, 1000):
            # daylight savings is messing this up
            expected = 1000 * ONE_DAY * i
            date = ticks_to_python(expected)
            ticks = python_to_ticks(date)
            if (abs(ticks - expected) > 1000 * 60 * 60):
                print("Failed at {}".format(i))
                print("Expected: {}".format(expected))
                print("Date: {}".format(date))
                print("Ticks: {}".format(ticks))
                self.assertEqual(ticks, expected)

        # in node: new Date(1698537600000) -> 2023-10-29T00:00:00.000Z
        self.assertEqual(python_to_ticks(
            ticks_to_python(1698537600000)), 1698537600000)


if __name__ == '__main__':
    unittest.main()
