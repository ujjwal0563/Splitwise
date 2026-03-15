package utils

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

type brevoEmailPayload struct {
	Sender struct {
		Email string `json:"email"`
		Name  string `json:"name"`
	} `json:"sender"`
	To []struct {
		Email string `json:"email"`
	} `json:"to"`
	Subject     string `json:"subject"`
	HTMLContent string `json:"htmlContent"`
}

func SendOTPEmailBrevo(toEmail string, otp string) error {
	apiKey := os.Getenv("BREVO_API_KEY")
	fromEmail := os.Getenv("BREVO_FROM_EMAIL")
	fromName := os.Getenv("BREVO_FROM_NAME")

	if apiKey == "" {
		return errors.New("missing BREVO_API_KEY")
	}
	if fromEmail == "" {
		return errors.New("missing BREVO_FROM_EMAIL")
	}
	if fromName == "" {
		fromName = "Splitwise"
	}

	payload := brevoEmailPayload{}
	payload.Sender.Email = fromEmail
	payload.Sender.Name = fromName
	payload.Subject = "Password Reset OTP"

	payload.To = append(payload.To, struct {
		Email string `json:"email"`
	}{Email: toEmail})

	payload.HTMLContent = `
		<h2>Password Reset OTP</h2>
		<p>Your OTP is:</p>
		<h1>` + otp + `</h1>
		<p>This OTP is valid for <b>5 minutes</b>.</p>
	`

	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal brevo payload: %w", err)
	}

	req, err := http.NewRequest(
		"POST",
		"https://api.brevo.com/v3/smtp/email",
		bytes.NewBuffer(body),
	)
	if err != nil {
		return err
	}

	req.Header.Set("accept", "application/json")
	req.Header.Set("api-key", apiKey)
	req.Header.Set("content-type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		respBody, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("brevo request failed with status %d: %s", resp.StatusCode, string(respBody))
	}

	return nil
}
