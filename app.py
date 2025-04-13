from flask import Flask, request, jsonify
import joblib
import numpy as np
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load the trained model and label encoder
clf = joblib.load("next_feature_model (1).pkl")
label_encoder = joblib.load("label_encoder.pkl")

DEFAULT_SESSION_LENGTH = 10  # Example default session length

@app.route('/compute-next-node', methods=['POST'])
def predict_next_feature():
    data = request.json
    previous_path = data.get('path', [])
    session_length = data.get('session_length', DEFAULT_SESSION_LENGTH)

    # Encode the sequence
    encoded = [label_encoder.transform([event])[0] if event in label_encoder.classes_ else -1 for event in previous_path]
    padded_sequence = [0] * (13 - len(encoded)) + encoded  # Pad to length 13
    input_vector = np.array([padded_sequence + [session_length]])  # Append session length

    # Predict next event
    predicted_label = clf.predict(input_vector)[0]
    predicted_event = label_encoder.inverse_transform([predicted_label])[0]

    return jsonify({'predicted_event': predicted_event})

if __name__ == '__main__':
    app.run(port=3002)