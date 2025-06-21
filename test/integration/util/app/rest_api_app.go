package app

import (
	"io"
)

type RESTApp struct {
	base *app
}

func NewRESTAPIApp(path string) *RESTApp {
	return &RESTApp{
		base: Must(BuildApp(path)),
	}
}

type RESTAPIConfig struct {
	Host              string
	Port              string
	Collection        string
	GoogleCredentials string
}

func (a *RESTApp) Start(ioWriter io.Writer, cfg RESTAPIConfig) (*Process, error) {
	env := map[string]string{
		"SERVER_HOST":                    cfg.Host,
		"SERVER_PORT":                    cfg.Port,
		"FIRESTORE_COLLECTION":           cfg.Collection,
		"GOOGLE_APPLICATION_CREDENTIALS": cfg.GoogleCredentials,
	}

	return a.base.start(ioWriter, ioWriter, env)
}
