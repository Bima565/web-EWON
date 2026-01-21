package influx

import (
	"context"
	"time"

	influxdb2 "github.com/influxdata/influxdb-client-go/v2"
)

type Writer struct {
	client influxdb2.Client
	org    string
	bucket string
}

func New(url, token, org, bucket string) *Writer {
	client := influxdb2.NewClient(url, token)
	return &Writer{
		client: client,
		org:    org,
		bucket: bucket,
	}
}

func (w *Writer) Write(fields map[string]interface{}) error {
	writeAPI := w.client.WriteAPIBlocking(w.org, w.bucket)

	p := influxdb2.NewPoint(
		"energy_data",
		nil,
		fields,
		time.Now(),
	)

	return writeAPI.WritePoint(context.Background(), p)
}
