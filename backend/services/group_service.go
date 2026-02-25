package services

import (
	"errors"

	"splitwise/models"
	"splitwise/repository"

	"go.mongodb.org/mongo-driver/bson/primitive"
)
type GroupService struct {
	Repo *repository.GroupRepo
}
func (s *GroupService) CreateGroup(userID string, req models.CreateGroupRequest) (*models.Group, error) {
	objID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, errors.New("invalid user id")
	}

	group := &models.Group{
		Name:      req.Name,
		CreatedBy: objID,
		Members:   []primitive.ObjectID{objID},
	}

	if err := s.Repo.CreateGroup(group); err != nil {
		return nil, err
	}
	return group, nil
}
func (s *GroupService) GetGroup(groupID string) (*models.Group, error) {
	objID, err := primitive.ObjectIDFromHex(groupID)
	if err != nil {
		return nil, errors.New("invalid group id")
	}
	return s.Repo.GetByID(objID)
}
func (s *GroupService) AddMember(groupID string, req models.AddMemberRequest) error {
	gID, err := primitive.ObjectIDFromHex(groupID)
	if err != nil {
		return errors.New("invalid group id")
	}

	uID, err := primitive.ObjectIDFromHex(req.UserID)
	if err != nil {
		return errors.New("invalid user id")
	}

	return s.Repo.AddMember(gID, uID)
}
func (s *GroupService) RemoveMember(groupID string, userID string) error {
	gID, err := primitive.ObjectIDFromHex(groupID)
	if err != nil {
		return errors.New("invalid group id")
	}

	uID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return errors.New("invalid user id")
	}

	return s.Repo.RemoveMember(gID, uID)
}
func (s *GroupService) DeleteGroup(groupID string) error {
	objID, err := primitive.ObjectIDFromHex(groupID)
	if err != nil {
		return errors.New("invalid group id")
	}
	return s.Repo.DeleteGroup(objID)
}
