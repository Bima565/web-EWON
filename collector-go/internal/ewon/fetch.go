package ewon

type Data struct {
	Voltage float64
	Current float64
	Power   float64
	Energy  float64
}

func Fetch(ip, user, pass string) (Data, error) {
	// DUMMY dulu (nanti diganti API eWON asli)
	return Data{
		Voltage: 220.5,
		Current: 1.2,
		Power:   264,
		Energy:  12.34,
	}, nil
}
