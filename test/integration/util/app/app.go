package app

import (
	"time"

	"fmt"
	"io"
	"os/exec"

	"github.com/onsi/gomega/gexec"
)

type app struct {
	path string
}

func Must(app *app, err error) *app {
	if err != nil {
		panic(err)
	}
	return app
}

func BuildApp(path string) (*app, error) {
	appExecutablePath, err := gexec.Build(path)
	if err != nil {
		return nil, fmt.Errorf("failed to compile the package: %w", err)
	}

	return &app{
		path: appExecutablePath,
	}, nil
}

func (a *app) start(outWriter, errWriter io.Writer, env map[string]string) (*Process, error) {
	executable := exec.Command(a.path)
	executable.Stdout = outWriter
	executable.Stderr = errWriter

	for k, v := range env {
		executable.Env = append(executable.Env, fmt.Sprintf("%s=%s", k, v))
	}

	session, err := gexec.Start(executable, outWriter, errWriter)
	if err != nil {
		return nil, fmt.Errorf("failed to start executable: %w", err)
	}

	return &Process{
		session: session,
	}, nil
}

type Process struct {
	session *gexec.Session
}

func (p *Process) TerminateAndWait(timeout time.Duration) *gexec.Session {
	return p.session.Terminate().Wait(timeout)
}
