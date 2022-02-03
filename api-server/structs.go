package main

type Response struct {
	Kind string `json:"kind"`
	Data Data   `json:"data"`
}

type Data struct {
	After    string     `json:"after"`
	Children []Children `json:"children"`
}

type Children struct {
	Kind     string   `json:"kind"`
	DataPost DataPost `json:"data"`
}

type DataPost struct {
	Id          string  `json:"id"`
	Subreddit   string  `json:"subreddit"`
	Author      string  `json:"author"`
	Title       string  `json:"title"`
	Created_Utc float64 `json:"created_utc"`
	Saved       bool    `json:"saved"`
	Selftext    string  `json:"selftext"`
	Body        string  `json:"body,omitempty"`
	Url         string  `json:"url,omitempty"`
	Fullname    string  `json:"name"`
	Permalink   string  `json:"permalink"`
	Link_Title  string  `json:"link_title,omitempty"`
	Link_Id     string  `json:"link_id,omitempty"`
}

type TokenResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

type error interface {
	Error() string
}

type ByTimestamp []*DataPost

func (a ByTimestamp) Len() int           { return len(a) }
func (a ByTimestamp) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }
func (a ByTimestamp) Less(i, j int) bool { return a[i].Created_Utc < a[j].Created_Utc }
