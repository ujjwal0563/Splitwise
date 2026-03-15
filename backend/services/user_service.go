package services

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"time"

	"splitwise/models"
	"splitwise/repository"
	"splitwise/utils"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type UserService struct {
	Repo *repository.UserRepo
}

func (s *UserService) Register(req models.RegisterRequest) (*models.User, error) {
	existing, _ := s.Repo.GetByEmail(req.Email)
	if existing != nil {
		return nil, errors.New("email already in use")
	}

	hashed, err := utils.HashPassword(req.Password)
	if err != nil {
		return nil, err
	}

	user := &models.User{
		Name:     req.Name,
		Email:    req.Email,
		Password: hashed,
	}

	if err := s.Repo.CreateUser(user); err != nil {
		return nil, err
	}
	return user, nil
}
func (s *UserService) Login(req models.LoginRequest) (string, error) {
	user, err := s.Repo.GetByEmail(req.Email)
	if err != nil {
		return "", errors.New("invalid email or password")
	}

	if !utils.CheckPassword(req.Password, user.Password) {
		return "", errors.New("invalid email or password")
	}

	token, err := utils.GenerateJWT(user.ID.Hex())
	if err != nil {
		return "", err
	}
	return token, nil
}
func (s *UserService) GetProfile(userID string) (*models.User, error) {
	objID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, errors.New("invalid user id")
	}
	return s.Repo.GetByID(objID)
}
func (s *UserService) UpdateProfile(userID string, req models.UpdateProfileRequest) error {
	objID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return errors.New("invalid user id")
	}
	return s.Repo.UpdateUser(objID, req.Name)
}

func (s *UserService) GetAll() ([]models.User, error) {
	users, err := s.Repo.GetAll()
	if err != nil {
		return nil, errors.New("failed to fetch users")
	}
	// Sanitize passwords from the response
	for i := range users {
		users[i].Password = ""
	}
	return users, nil
}

func generateResetToken() (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

func (s *UserService) ForgotPassword(req models.ForgotPasswordRequest) error {
	user, err := s.Repo.GetByEmail(req.Email)
	if err != nil {
		return errors.New("no account found with that email")
	}

	token, err := generateResetToken()
	if err != nil {
		return errors.New("failed to generate reset token")
	}

	reset := &models.PasswordReset{
		UserID:    user.ID,
		Token:     token,
		ExpiresAt: time.Now().Add(1 * time.Hour),
	}

	if err := s.Repo.CreatePasswordReset(reset); err != nil {
		return errors.New("failed to create reset token")
	}

	if err := utils.SendOTPEmailBrevo(user.Email, token); err != nil {
		s.Repo.DeletePasswordReset(reset.ID)
		return errors.New("failed to send reset token email")
	}

	return nil
}

func (s *UserService) ResetPassword(req models.ResetPasswordRequest) error {
	if len(req.NewPassword) < 6 {
		return errors.New("password must be at least 6 characters")
	}

	reset, err := s.Repo.GetPasswordResetByToken(req.Token)
	if err != nil {
		return errors.New("invalid or expired reset token")
	}

	if time.Now().After(reset.ExpiresAt) {
		s.Repo.DeletePasswordReset(reset.ID)
		return errors.New("reset token has expired")
	}

	hashed, err := utils.HashPassword(req.NewPassword)
	if err != nil {
		return errors.New("failed to hash password")
	}

	if err := s.Repo.UpdatePassword(reset.UserID, hashed); err != nil {
		return errors.New("failed to update password")
	}

	// Clean up the used token
	s.Repo.DeletePasswordReset(reset.ID)

	return nil
}
