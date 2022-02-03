package main

import (
	"math/rand"
	"time"
)

func GenerateSecretKey() string {
	const letterBytes = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
	key := make([]byte, 64)
	rand.Seed(time.Now().UnixNano())
	for i := range key {
		key[i] = letterBytes[rand.Intn(len(letterBytes))]
	}

	secret_key := string(key)
	return secret_key
}
