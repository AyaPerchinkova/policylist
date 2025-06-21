package decision

type Response struct {
	Message string `json:"response"`
}

type IP struct {
	Username string `json:"username"`
	Address  string `json:"ip"`
}
