package config

import (
	"encoding/json"
	"os"
)

type Config struct {
	Influx struct {
		URL    string `json:"url"`
		Token  string `json:"token"`
		Org    string `json:"org"`
		Bucket string `json:"bucket"`
	} `json:"influx"`

	Ewon struct {
		IP   string `json:"ip"`
		User string `json:"user"`
		Pass string `json:"pass"`
	} `json:"ewon"`

	IntervalSeconds int `json:"interval_seconds"`
}

func Load() (Config, error) {
	file, err := os.Open("config.json")
	if err != nil {
		return Config{}, err
	}
	defer file.Close()

	var cfg Config
	err = json.NewDecoder(file).Decode(&cfg)
	return cfg, err
}
