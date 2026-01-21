package main

import (
	"fmt"
	"time"

	"web-ewon/collector/internal/config"
	"web-ewon/collector/internal/ewon"
	"web-ewon/collector/internal/influx"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		fmt.Println("❌ Gagal load config:", err)
		return
	}

	writer := influx.New(
		cfg.Influx.URL,
		cfg.Influx.Token,
		cfg.Influx.Org,
		cfg.Influx.Bucket,
	)

	ticker := time.NewTicker(time.Duration(cfg.IntervalSeconds) * time.Second)

	for range ticker.C {
		data, err := ewon.Fetch(
			cfg.Ewon.IP,
			cfg.Ewon.User,
			cfg.Ewon.Pass,
		)
		if err != nil {
			fmt.Println("❌ Fetch eWON error:", err)
			continue
		}

		err = writer.Write(map[string]interface{}{
			"voltage": data.Voltage,
			"current": data.Current,
			"power":   data.Power,
			"energy":  data.Energy,
		})

		if err != nil {
			fmt.Println("❌ Influx write error:", err)
		} else {
			fmt.Println("✅ Data terkirim ke InfluxDB")
		}
	}
}
