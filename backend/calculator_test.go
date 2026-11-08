package main

import (
	"math"
	"testing"
)

func TestCalculate(t *testing.T) {
	tests := []struct {
		name, operation string
		a, b, want      float64
		wantError       bool
	}{
		{"addition", "add", 2, 3, 5, false},
		{"subtraction", "subtract", -2, 3, -5, false},
		{"multiplication", "multiply", 1.5, 2, 3, false},
		{"division", "divide", 7, 2, 3.5, false},
		{"zero", "add", 0, 0, 0, false},
		{"division by zero", "divide", 1, 0, 0, true},
		{"invalid operation", "power", 2, 3, 0, true},
		{"overflow", "multiply", math.MaxFloat64, 2, 0, true},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := calculate(tt.operation, tt.a, tt.b)
			if (err != nil) != tt.wantError {
				t.Fatalf("error = %v, wantError = %v", err, tt.wantError)
			}
			if !tt.wantError && got != tt.want {
				t.Errorf("got %v, want %v", got, tt.want)
			}
		})
	}
}
