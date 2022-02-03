package main

import (
	"encoding/json"
	"io/ioutil"
	"net/http"
	"os"
	"path/filepath"
)

func readJSONData(filepath string) []*DataPost {
	file, err := os.ReadFile(filepath)
  check(err)

  var read []*DataPost
	json.Unmarshal(file, &read)

	return read
}

func writeJSONFile(filename string, v interface{}) {
	file, _ := json.Marshal(v)

	if filepath.Dir(filename) != "." {
		if _, err := os.Stat(filepath.Dir(filename)); os.IsNotExist(err) {
			err := os.Mkdir(filepath.Dir(filename), 0777)
		  check(err)	
		}
	}

	err := ioutil.WriteFile(filename, file, 0644)
  check(err)	
}

func sendJSONResponse(w http.ResponseWriter, i interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(i)
}
