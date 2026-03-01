package services

import (
	"errors"

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
