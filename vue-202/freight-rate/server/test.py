import jsonpickle
import unittest


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
                "items" : []
            }

            data["items"].append(1)
    
            output = jsonpickle.encode(data)
            self.assertEqual(output, '{"items": [1]}')


if __name__ == '__main__':
    unittest.main()
