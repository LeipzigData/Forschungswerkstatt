BEGIN;
CREATE TABLE sensordata (
	id SERIAL PRIMARY KEY,
	created_time TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
	temperature FLOAT NOT NULL,
	humidity FLOAT NOT NULL,
	light FLOAT NOT NULL,
	occupancy BOOLEAN NOT NULL,
	people_count INT NOT NULL
);

-- On any insert/update/delete of sensor data, send a JSON-formatted notification to
-- a 'sensordata_update' channel.
CREATE OR REPLACE FUNCTION sensordata_notify_func() RETURNS trigger as $$
DECLARE
  payload text;
BEGIN
	IF TG_OP = 'DELETE' THEN
    payload := row_to_json(tmp)::text FROM (
			SELECT
				OLD.id as id,
				TG_OP as _op,
				TG_TABLE_NAME as _tablename
		) tmp;
	ELSE
		payload := row_to_json(tmp)::text FROM (
			SELECT
				NEW.*,
				TG_TABLE_NAME as _tablename,
				TG_OP as _op
		) tmp;
		IF octet_length( payload ) > 8000 THEN
			-- payload is too big for a pg_notify.
			payload := row_to_json(tmp)::text FROM (
				SELECT
					NEW.id as id,
					'payload length > 8000 bytes' as error,
					TG_TABLE_NAME as _tablename,
					TG_OP as _op
			) tmp;
		END IF;
	END IF;
  PERFORM pg_notify('sensordata_updates'::text, payload);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sensordata_notify_trig AFTER INSERT OR UPDATE OR DELETE ON sensordata
   FOR EACH ROW EXECUTE PROCEDURE sensordata_notify_func();
