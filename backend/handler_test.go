package main

import (
	"encoding/json"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestCalculateHandler(t *testing.T) {
	tests := []struct {
		name, method, body string
		status             int
		result             float64
	}{
		{"success", "POST", `{"operation":"divide","a":12,"b":3}`, 200, 4},
		{"zero result", "POST", `{"operation":"add","a":0,"b":0}`, 200, 0},
		{"missing operand", "POST", `{"operation":"add","a":2}`, 400, 0},
		{"null operand", "POST", `{"operation":"add","a":null,"b":2}`, 400, 0},
		{"invalid number", "POST", `{"operation":"add","a":"hello","b":2}`, 400, 0},
		{"division by zero", "POST", `{"operation":"divide","a":2,"b":0}`, 400, 0},
		{"invalid operation", "POST", `{"operation":"power","a":2,"b":2}`, 400, 0},
		{"invalid JSON", "POST", `{`, 400, 0},
		{"trailing JSON", "POST", `{"operation":"add","a":2,"b":2} {}`, 400, 0},
		{"wrong method", "GET", "", 405, 0},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			request := httptest.NewRequest(tt.method, "/api/calculate", strings.NewReader(tt.body))
			response := httptest.NewRecorder()
			calculateHandler(response, request)
			if response.Code != tt.status {
				t.Fatalf("status = %d, want %d", response.Code, tt.status)
			}
			if response.Header().Get("Content-Type") != "application/json" {
				t.Error("expected a JSON response")
			}
			var body struct {
				Result *float64 `json:"result"`
				Error  string   `json:"error"`
			}
			if err := json.Unmarshal(response.Body.Bytes(), &body); err != nil {
				t.Fatal(err)
			}
			if tt.status == 200 {
				if body.Result == nil || *body.Result != tt.result {
					t.Errorf("unexpected result: %s", response.Body)
				}
			} else if body.Error == "" {
				t.Error("expected an error message")
			}
		})
	}
}
