package main

import (
	"log"
	"net/http"
)

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/api/calculate", calculateHandler)

	log.Println("Calculator API running on http://127.0.0.1:8080")
	log.Fatal(http.ListenAndServe("127.0.0.1:8080", mux))
}
