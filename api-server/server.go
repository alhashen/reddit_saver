package main

import (
	"encoding/csv"
	"encoding/json"
	"fmt"
	"github.com/gorilla/sessions"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"os"
	"sort"
	"strings"
	"time"
)

var cookie_store *sessions.CookieStore
var id_list []string

func init() {
	if _, err := os.Stat("config.json"); err == nil {

		fmt.Println("Reading config..")
		var read map[string]interface{}
		file, err := os.ReadFile("config.json")
		check(err)
		json.Unmarshal(file, &read)

		secret_key := read["SECRET_KEY"].(string)
		fmt.Println(secret_key)
		cookie_store = sessions.NewCookieStore([]byte(secret_key))

	} else {

		fmt.Println("Creating config..")
		secret_key := GenerateSecretKey()
		var s = map[string]string{"SECRET_KEY": secret_key}
		writeJSONFile("config.json", s)
		fmt.Println(secret_key)
		cookie_store = sessions.NewCookieStore([]byte(secret_key))

	}
}

func main() {
	fs := http.FileServer(http.Dir("./build"))
	http.Handle("/", http.StripPrefix("/build", fs))
	http.HandleFunc("/test", handler)
	//http.Handle("/ui", http.StripPrefix("/build", fs))
	http.HandleFunc("/login", loginHandler)
	http.HandleFunc("/callback", callbackHandler)
	http.HandleFunc("/home", homeHandler)
	http.HandleFunc("/fetch", fetchHandler)
	http.HandleFunc("/convert", convertHandler)
	http.HandleFunc("/unsave", unsaveHandler)
	http.HandleFunc("/sync", syncHandler)
	http.HandleFunc("/favicon.ico", doNothing)
	log.Fatal(http.ListenAndServe(PORT, nil))
}

func doNothing(w http.ResponseWriter, r *http.Request) {}

func handler(w http.ResponseWriter, r *http.Request) {
	session, _ := cookie_store.Get(r, "r_Cookie")
	username := session.Values["USERNAME"].(string)
	SAVED_DATA := username + "/saved-data.json"
	SAVED_FETCH := username + "/saved-fetch.json"

	var read []*DataPost
	if _, err := os.Stat(SAVED_FETCH); err == nil {
		read = readJSONData(SAVED_FETCH)
	} else if _, err := os.Stat(SAVED_DATA); err == nil {
		read = readJSONData(SAVED_DATA)
	} else {
		check(err)
	}

	fmt.Println(len(read))
}

func homeHandler(w http.ResponseWriter, r *http.Request) {
	session, _ := cookie_store.Get(r, "r_Cookie")
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
	w.Header().Set("Access-Control-Allow-Credentials", "true")
	if session.Values["USERNAME"] == nil {
		w.WriteHeader(http.StatusNotFound)
		fmt.Println("Session not found")
	} else {
		username := session.Values["USERNAME"].(string)
		SAVED_DATA := username + "/saved-data.json"
		SAVED_FETCH := username + "/saved-fetch.json"

		if _, err := os.Stat(SAVED_DATA); err == nil {
			read := readJSONData(SAVED_DATA)
			Reverse(read)
			sendJSONResponse(w, read)
		} else if _, err := os.Stat(SAVED_FETCH); err == nil {
			read := readJSONData(SAVED_FETCH)
			Reverse(read)
			sendJSONResponse(w, read)
		} else {
			w.WriteHeader(http.StatusOK)
		}
	}
}

func loginHandler(w http.ResponseWriter, r *http.Request) {
	URL := fmt.Sprintf("https://www.reddit.com/api/v1/authorize?client_id=%s"+
		"&response_type=code&state=%s&redirect_uri=%s&"+
		"duration=permanent&scope=%s",
		CLIENT_ID, STATE, URI, SCOPE)
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
	w.Header().Set("Access-Control-Allow-Credentials", "true")

	var json_resp = map[string]string{"auth_url": URL}
	sendJSONResponse(w, json_resp)
}

func callbackHandler(w http.ResponseWriter, r *http.Request) {
	code := r.URL.Query().Get("code")
	token := getToken(code)

	session, _ := cookie_store.Get(r, "r_Cookie")
	session.Values["REFRESH_TOKEN"] = token.RefreshToken
	session.Values["ACCESS_TOKEN"] = token.AccessToken
	session.Values["USERNAME"] = getUserName(w, r, session)
	session.Options.MaxAge = 31536000
	session.Save(r, w)
}

func fetchHandler(w http.ResponseWriter, r *http.Request) {
	session, _ := cookie_store.Get(r, "r_Cookie")
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
	w.Header().Set("Access-Control-Allow-Credentials", "true")
	start := time.Now()
	checkToken(w, r, session)

	username := session.Values["USERNAME"].(string)
	SAVED_DATA := username + "/saved-data.json"
	SAVED_FETCH := username + "/saved-fetch.json"

	URL := "https://oauth.reddit.com/user/" + username + "/saved"

	c := http.Client{Timeout: time.Duration(60) * time.Second}
	req, err := http.NewRequest("GET", URL, nil)
	check(err)

	req.Header.Set("User-Agent", HEADER_USER)
	req.Header.Set("Authorization", "bearer "+session.Values["ACCESS_TOKEN"].(string))
	after := ""
	q := req.URL.Query()
	q.Add("limit", "100")
	q.Add("raw_json", "1")
	q.Add("after", "")
	req.URL.RawQuery = q.Encode()

	fmt.Println(req.URL)

	if _, err := os.Stat(SAVED_DATA); err == nil {
		fmt.Println("Found BIG file, fetching partially..")

		json_read := readJSONData(SAVED_DATA)

		resp, err := c.Do(req)
		check(err)
		defer resp.Body.Close()

		body, err := ioutil.ReadAll(resp.Body)
		check(err)

		var res Response
		json.Unmarshal([]byte(body), &res)
		fetch := parseData(&res, false)
		Reverse(fetch)

		merge := Merge(json_read, fetch, false)
		writeJSONFile(SAVED_DATA, merge)
		w.WriteHeader(http.StatusOK)

	} else if _, err := os.Stat(SAVED_FETCH); err == nil {

		fmt.Println("Found saved file, fetching partially..")

		json_read := readJSONData(SAVED_FETCH)

		resp, err := c.Do(req)
		check(err)
		defer resp.Body.Close()

		body, err := ioutil.ReadAll(resp.Body)
		check(err)

		var res Response
		json.Unmarshal([]byte(body), &res)

		fetch := parseData(&res, false)

		Reverse(fetch)

		merge := Merge(json_read, fetch, false)

		writeJSONFile(SAVED_FETCH, merge)
		w.WriteHeader(http.StatusOK)

	} else {

		var saved []*DataPost

		for i := 0; i < 10; i++ {
			resp, err := c.Do(req)
			check(err)
			defer resp.Body.Close()

			body, err := ioutil.ReadAll(resp.Body)
			check(err)

			var res Response
			json.Unmarshal([]byte(body), &res)

			fetch := parseData(&res, false)
			saved = append(saved, fetch...)

			after = saved[len(saved)-1].Fullname
			q.Set("after", after)
			req.URL.RawQuery = q.Encode()

		}

		Reverse(saved)

		writeJSONFile(SAVED_FETCH, saved)
		w.WriteHeader(http.StatusOK)

	}

	fmt.Println(time.Since(start))

}

func convertHandler(w http.ResponseWriter, r *http.Request) {
	session, _ := cookie_store.Get(r, "r_Cookie")
	username := session.Values["USERNAME"].(string)
	SAVED_DATA := username + "/saved-data.json"
	SAVED_FETCH := username + "/saved-fetch.json"

	if _, err := os.Stat(SOURCE_POSTS_PATH); err == nil {
		if _, err := os.Stat(SOURCE_COMMENTS_PATH); err == nil {

			fmt.Println("Converting posts..")
			convertedPost := convertData(w, r, session, true)

			fmt.Println("Converting comments..")
			convertedComment := convertData(w, r, session, false)
			mergedSlice := Merge(convertedPost, convertedComment, false)

			sort.Sort(ByTimestamp(mergedSlice))

			if _, err := os.Stat(SAVED_FETCH); err == nil {
				fmt.Println("Found saved files, merging...")

				fetch := readJSONData(SAVED_FETCH)

				mergedFull := Merge(fetch, mergedSlice, true)

				writeJSONFile(SAVED_DATA, mergedFull)
				err = os.Remove(SAVED_FETCH)
				check(err)

			} else {
				writeJSONFile(SAVED_DATA, mergedSlice)
			}
		}
	}
}

func unsaveHandler(w http.ResponseWriter, r *http.Request) {

	session, _ := cookie_store.Get(r, "r_Cookie")
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
	w.Header().Set("Access-Control-Allow-Credentials", "true")
	r.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	id := r.URL.Query().Get("name")
	unsaveFromReddit(w, r, session, id)

}

func syncHandler(w http.ResponseWriter, r *http.Request) {
	session, _ := cookie_store.Get(r, "r_Cookie")
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
	w.Header().Set("Access-Control-Allow-Credentials", "true")
	username := session.Values["USERNAME"].(string)
	SAVED_DATA := username + "/saved-data.json"
	SAVED_FETCH := username + "/saved-fetch.json"

	var read, slice_to_compare, substracted_slice []*DataPost
	var id_list []string
	var empty struct{}
	not_saved_sets := make(map[string]struct{})

	if _, err := os.Stat(SAVED_FETCH); err == nil {
		read = readJSONData(SAVED_FETCH)
	} else if _, err := os.Stat(SAVED_DATA); err == nil {
		read = readJSONData(SAVED_DATA)
	} else {
		check(err)
	}

	for _, v := range read {
		id_list = append(id_list, v.Fullname)
	}

	id_chunks := divideSlice(id_list)
	fmt.Println(len(id_chunks))

	checkToken(w, r, session)

	start := time.Now()
	slice_to_compare = getInfo(id_chunks, session, false)
	fmt.Println(time.Since(start))

	start2 := time.Now()
	for _, v := range slice_to_compare {
		if v.Saved == false {
			not_saved_sets[v.Id] = empty
		}
	}
	fmt.Println(time.Since(start2))

	start3 := time.Now()
	for _, v := range read {
		if _, ok := not_saved_sets[v.Id]; !ok {
			substracted_slice = append(substracted_slice, v)
		}
	}
	fmt.Println(time.Since(start3))

	fmt.Println(len(substracted_slice))
	writeJSONFile("test.json", substracted_slice)

	fmt.Println(len(slice_to_compare))

}

func getToken(code string) TokenResponse {
	c := http.Client{Timeout: time.Duration(20) * time.Second}
	data := url.Values{}
	data.Add("grant_type", "authorization_code")
	data.Add("code", code)
	data.Add("redirect_uri", URI)
	req, _ := http.NewRequest("POST", "https://www.reddit.com/api/v1/access_token",
		strings.NewReader(data.Encode()))
	req.SetBasicAuth(CLIENT_ID, "")
	req.Header.Set("User-Agent", HEADER_USER)

	resp, err := c.Do(req)
	check(err)
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	check(err)

	var token TokenResponse

	json.Unmarshal([]byte(body), &token)

	return token
}

func getNewToken(refresh_token string) string {
	c := http.Client{Timeout: time.Duration(20) * time.Second}
	data := url.Values{}
	data.Add("grant_type", "refresh_token")
	data.Add("refresh_token", refresh_token)
	req, _ := http.NewRequest("POST", "https://www.reddit.com/api/v1/access_token",
		strings.NewReader(data.Encode()))
	req.SetBasicAuth(CLIENT_ID, "")
	req.Header.Set("User-Agent", HEADER_USER)

	resp, err := c.Do(req)
	check(err)
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	check(err)

	var token TokenResponse

	json.Unmarshal([]byte(body), &token)

	return token.AccessToken
}

func getUserName(w http.ResponseWriter, r *http.Request, s *sessions.Session) string {
	c := http.Client{Timeout: time.Duration(20) * time.Second}
	req, _ := http.NewRequest("GET", "https://oauth.reddit.com/api/v1/me", nil)
	req.Header.Set("User-Agent", HEADER_USER)
	req.Header.Set("Authorization", "bearer "+s.Values["ACCESS_TOKEN"].(string))

	resp, err := c.Do(req)
	check(err)
	defer resp.Body.Close()

	body, _ := ioutil.ReadAll(resp.Body)
	check(err)

	var res map[string]interface{}

	json.Unmarshal([]byte(body), &res)

	username := res["name"].(string)
	return username
}

func checkToken(w http.ResponseWriter, r *http.Request, s *sessions.Session) {
	c := http.Client{Timeout: time.Duration(20) * time.Second}
	req, _ := http.NewRequest("GET", "https://oauth.reddit.com/api/v1/me", nil)
	req.Header.Set("User-Agent", HEADER_USER)
	req.Header.Set("Authorization", "bearer "+s.Values["ACCESS_TOKEN"].(string))

	resp, err := c.Do(req)
	check(err)

	if resp.StatusCode == 401 {
		new_token := getNewToken(s.Values["REFRESH_TOKEN"].(string))
		s.Values["ACCESS_TOKEN"] = new_token
		s.Options.MaxAge = 31536000
		s.Save(r, w)
	}
}

func convertData(w http.ResponseWriter, r *http.Request, s *sessions.Session, submission bool) []*DataPost {
	var (
		source_slice  []string
		source_chunks [][]string
		info_prefix   string
		source_file   *os.File
		err           error
		keep_link     = false
	)

	if submission {

		source_file, err = os.Open(SOURCE_POSTS_PATH)
		if err != nil {
			log.Fatalln(err)
		}

		info_prefix = `t3_`

	} else {

		source_file, err = os.Open(SOURCE_COMMENTS_PATH)
		if err != nil {
			log.Fatalln(err)
		}

		info_prefix = `t1_`
		keep_link = true

	}

	defer source_file.Close()
	reader := csv.NewReader(source_file)
	read_csv, _ := reader.ReadAll()

	for _, v := range read_csv[1:] {
		source_slice = append(source_slice, info_prefix+v[0])
	}

	source_chunks = divideSlice(source_slice)

	checkToken(w, r, s)

	var converted []*DataPost

	converted = getInfo(source_chunks, s, keep_link)

	//Ngambil data parent title kalo tipe komen :[
	if !submission {
		var link_ids []string
		var parents []*DataPost

		for _, v := range converted {
			link_ids = append(link_ids, v.Link_Id)
		}

		id_chunks := divideSlice(link_ids)
		parents = getInfo(id_chunks, s, keep_link)

		for i, v := range converted {
			v.Title = parents[i].Title
			v.Link_Id = ""
		}

	}

	return converted
}

func getData(URL string, s *sessions.Session, keep_link bool) []*DataPost {
	c := http.Client{Timeout: time.Duration(60) * time.Second}
	req, err := http.NewRequest("GET", URL, nil)
	check(err)

	req.Header.Set("User-Agent", HEADER_USER)
	req.Header.Set("Authorization", "bearer "+s.Values["ACCESS_TOKEN"].(string))

	resp, err := c.Do(req)
	check(err)
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	check(err)

	var res Response
	var data_slice []*DataPost

	json.Unmarshal([]byte(body), &res)

	data_slice = parseData(&res, keep_link)

	return data_slice
}

func getInfo(chunks [][]string, s *sessions.Session, keep_link bool) []*DataPost {
	var info []*DataPost

	for _, chunk := range chunks {
		URL := URL_REDDIT_INFO

		for _, v := range chunk {
			URL = URL + v + `,`
		}

		data := getData(URL, s, keep_link)
		info = append(info, data...)
	}

	return info
}

func parseData(res *Response, keep_link bool) []*DataPost {
	var data []*DataPost
	col := res.Data.Children
	for _, v := range col {
		dp := v.DataPost
		dp.Permalink = "https://www.reddit.com" + dp.Permalink
		if len(dp.Selftext) == 0 && len(dp.Body) > 0 {
			dp.Selftext = dp.Body
			dp.Body = ""
		}
		if len(dp.Selftext) >= 500 {
			dp.Selftext = dp.Selftext[:500]
		}
		if len(dp.Title) == 0 {
			dp.Title = dp.Link_Title
			dp.Link_Title = ""
			if !keep_link {
				dp.Link_Id = ""
			}
		}

		data = append(data, &dp)

	}

	return data
}

func unsaveFromReddit(w http.ResponseWriter, r *http.Request, s *sessions.Session, link_id string) {

	checkToken(w, r, s)

	c := http.Client{Timeout: time.Duration(20) * time.Second}
	data := url.Values{}

	req, _ := http.NewRequest("POST", "https://oauth.reddit.com/api/unsave",
		strings.NewReader(data.Encode()))
	q := req.URL.Query()
	q.Add("id", link_id)
	req.URL.RawQuery = q.Encode()

	req.Header.Set("User-Agent", HEADER_USER)
	req.Header.Set("Authorization", "bearer "+s.Values["ACCESS_TOKEN"].(string))

	resp, err := c.Do(req)
	check(err)
	defer resp.Body.Close()

	var json_resp map[string]interface{}
	err = json.NewDecoder(resp.Body).Decode(&json_resp)
	check(err)

	if json_resp["error"] != nil {
		w.WriteHeader(http.StatusBadRequest)
		fmt.Printf("%v: %v\n", json_resp["error"], json_resp["message"])
	} else {
		w.WriteHeader(http.StatusOK)
	}

}
