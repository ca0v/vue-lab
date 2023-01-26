import jsonpickle
import unittest

from fun import date_to_unix, ticks_to_unix, unix_to_date, unix_to_ticks


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
        self.assertEqual(unix_to_date(0), '1970-01-01')
        self.assertEqual(date_to_unix('1970-01-01'), 0)
        self.assertEqual(ticks_to_unix(900), 0)
        self.assertEqual(ticks_to_unix(1234567), 1234)
        self.assertEqual(unix_to_ticks(1234), 1234000)


if __name__ == '__main__':
    unittest.main()
