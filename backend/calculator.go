package main

import (
	"errors"
	"math"
)

func calculate(operation string, a, b float64) (float64, error) {
	var result float64
	switch operation {
	case "add":
		result = a + b
	case "subtract":
		result = a - b
	case "multiply":
		result = a * b
	case "divide":
		if b == 0 {
			return 0, errors.New("cannot divide by zero")
		}
		result = a / b
	default:
		return 0, errors.New("invalid operation")
	}

	if math.IsNaN(result) || math.IsInf(result, 0) {
		return 0, errors.New("result is outside the supported number range")
	}
	return result, nil
}
