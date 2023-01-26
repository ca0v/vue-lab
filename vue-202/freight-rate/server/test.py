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
    def test_unix_time(self):
        python_date = datetime(1970, 1, 1)
        self.assertEqual(python_to_date(python_date), '1970-01-01')
        self.assertEqual(date_to_python('1970-01-01'), python_date)
        self.assertEqual(ticks_to_python(
            900), datetime(1970, 1, 1, 0, 0, 0, 900000))
        self.assertEqual(python_to_ticks(python_date), 18000000)


if __name__ == '__main__':
    unittest.main()
