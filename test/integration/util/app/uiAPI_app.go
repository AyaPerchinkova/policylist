package app

import "io"

type UIAPIConfig struct {
	Host              string
	Port              string
	Collection        string
	GoogleCredentials string
}

func NewUIApiApp(path string) *UIAPIApp {
	return &UIAPIApp{
		base: Must(BuildApp(path)),
	}
}

type UIAPIApp struct {
	base *app
}

func (a *UIAPIApp) Start(ioWriter io.Writer, cfg UIAPIConfig) (*Process, error) {
	env := map[string]string{
		"SERVER_HOST":                    cfg.Host,
		"SERVER_PORT":                    cfg.Port,
		"FIRESTORE_COLLECTION":           cfg.Collection,
		"GOOGLE_APPLICATION_CREDENTIALS": cfg.GoogleCredentials,
	}

	return a.base.start(ioWriter, ioWriter, env)
}
