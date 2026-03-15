package utils

import (
	"bytes"
	"crypto/rand"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"math/big"
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
	payload.Subject = "Your Password Reset OTP - Splitwise"

	payload.To = append(payload.To, struct {
		Email string `json:"email"`
	}{Email: toEmail})

	payload.HTMLContent = `
		<html>
		<body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
			<div style="max-width: 500px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
				<h2 style="color: #333; text-align: center;">Password Reset Request</h2>
				<p style="color: #666; text-align: center; margin-bottom: 30px;">Use this OTP to reset your Splitwise password</p>
				
				<div style="background-color: #f0f0f0; padding: 20px; text-align: center; border-radius: 6px; margin-bottom: 20px;">
					<div style="font-size: 48px; font-weight: bold; color: #16a34a; letter-spacing: 10px; font-family: monospace;">` + otp + `</div>
				</div>
				
				<p style="color: #999; text-align: center; font-size: 14px; margin-bottom: 20px;">This OTP is valid for <b>10 minutes</b></p>
				
				<hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
				
				<p style="color: #666; font-size: 12px;">
					If you didn't request a password reset, please ignore this email. 
					Do not share this OTP with anyone.
				</p>
			</div>
		</body>
		</html>
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

// Generate6DigitOTP generates a random 6-digit OTP
func Generate6DigitOTP() (string, error) {
	const digits = 6
	maxNum := new(big.Int).Exp(big.NewInt(10), big.NewInt(int64(digits)), nil)
	num, err := rand.Int(rand.Reader, maxNum)
	if err != nil {
		return "", err
	}
	// Pad with zeros if needed
	return fmt.Sprintf("%06d", num), nil
}
