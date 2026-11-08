package main

import (
	"encoding/json"
	"io"
	"net/http"
)

type calculationRequest struct {
	Operation string   `json:"operation"`
	A         *float64 `json:"a"`
	B         *float64 `json:"b"`
}

func calculateHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.Header().Set("Allow", "POST")
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "use POST for calculations"})
		return
	}

	body, err := io.ReadAll(http.MaxBytesReader(w, r.Body, 4096))
	var input calculationRequest
	if err != nil || json.Unmarshal(body, &input) != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid JSON request"})
		return
	}
	if input.A == nil || input.B == nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "a and b are required numbers"})
		return
	}

	result, err := calculate(input.Operation, *input.A, *input.B)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, map[string]float64{"result": result})
}

func writeJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(data)
}
