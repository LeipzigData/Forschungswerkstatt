import json
import psycopg2
from threading import Thread, Event 
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from flask_socketio import SocketIO, emit
from flask import Flask, render_template, copy_current_request_context

    
app = Flask(__name__, static_folder='monitor/build', static_url_path="/")
app.config['SECRET_KEY'] = "glkrefefewafngaeläfgjierojtf"
app.config['DEBUG'] = True
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="gevent", engineio_logger=True)

cnn = psycopg2.connect(database="sensordata", user="pi", password="savepassword")
cnn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)

thread=None

#dataSchema = {
#    "type": "object",
#    "properties": {
#        "id": {"type": "number"},
#        "created_time": {"type": "string"},
#        "temperature": {"type": "number"},
#        "humidity": {"type": "number"},
#        "light": {"type": "number"},
#        "occupancy": {"type": "boolean"},
#        "people_count": {"type": "number"},
#    },
#}

def listen():
    print("hallo from listen fkt")
    cur = cnn.cursor()
    cur.execute("LISTEN sensordata_updates;")
    while True:
        cnn.poll()
        while cnn.notifies:
            n = cnn.notifies.pop()
            payload = json.loads(n.payload)
            print(payload)
            payload = {key: value for key, value in payload.items() if not key.startswith("_")} 
            print(payload)
            socketio.emit('update-data', payload, namespace='/data')
        socketio.sleep(0)


@socketio.on('connect', namespace='/data')
def on_connect():
    cur = cnn.cursor()
    cur.execute("select row_to_json(t) from (select * from sensordata ORDER BY created_time DESC LIMIT 50) t ORDER BY t.row_to_json->>'created_time' ASC;")
    rows = cur.fetchall()
    for row in rows:
        #print(row)
        emit('update-data', row)

@app.route('/')
def hello_world():
    global thread
    if thread is None:
        thread = Thread(target=listen)
        thread.daemon = True
        thread.start()
    return app.send_static_file("index.html")


if __name__ == '__main__':
    socketio.run(app, host="0.0.0.0", port=7000)
