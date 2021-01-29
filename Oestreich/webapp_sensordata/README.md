# Webapp Sensordata

A first *proof-of-concept* was done for visualizing sensordata in a minimal react.js frontend.

Therefore a WebSocket Connection to a minimal python flask backend is established. The Backend is depending on a *PostgreSQL* Database. Every INSERT statement triggers a NOTIFY function in the database, which will inform every subscriber of a Channel within a Pub/Sub Pattern of the event and the inserted data. This will be be received by the backend and forwarded to the Client via Websocket. 

Further development is planned within an AlmaLab pupil project.

PostgreSQL setup:
- Create a user role `pi` with the password `savepassword`
- Execute the sql code in `sql/0001-add-sensordata-table.sql`
- `COMMIT;`
- Grant all privileges for `sensordata` to `pi`

Set up the Flask Backend:
- `python3 -m venv ./venv`
- `. ./venv/bin/activate`
- `pip install --upgrade pip`
- `pip install -r requirements.txt`

Setup the monitor:
- `cd monitor`
- `npm install`
- `npm run build`

Start the app:
- `cd ..`
- `python app.py`
- Open your webbrowser on localhost:7000 

Test it by writing data into the database. For example: 
```
INSERT INTO sensordata (temperature, humidity, light, occupancy, people_count) VALUES (30, 50, 110, True, 2);
```

You should now see the inserted data appearing in the frontend.
