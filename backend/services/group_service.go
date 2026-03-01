package services

import (
	"errors"

	"splitwise/models"
	"splitwise/repository"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type GroupService struct {
	Repo           *repository.GroupRepo
	UserRepo       *repository.UserRepo
	ExpenseRepo    *repository.ExpenseRepo
	SettlementRepo *repository.SettlementRepo
}

// helper: check if a userID is in the group's members list
func isMember(members []primitive.ObjectID, userID primitive.ObjectID) bool {
	for _, m := range members {
		if m == userID {
			return true
		}
	}
	return false
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

func (s *GroupService) GetGroup(groupID string, userID string) (*models.Group, error) {
	gID, err := primitive.ObjectIDFromHex(groupID)
	if err != nil {
		return nil, errors.New("invalid group id")
	}

	uID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, errors.New("invalid user id")
	}

	group, err := s.Repo.GetByID(gID)
	if err != nil {
		return nil, errors.New("group not found")
	}

	// Auth: only members can view the group
	if !isMember(group.Members, uID) {
		return nil, errors.New("you are not a member of this group")
	}

	return group, nil
}

func (s *GroupService) UpdateGroup(groupID string, userID string, req models.UpdateGroupRequest) error {
	gID, err := primitive.ObjectIDFromHex(groupID)
	if err != nil {
		return errors.New("invalid group id")
	}

	uID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return errors.New("invalid user id")
	}

	group, err := s.Repo.GetByID(gID)
	if err != nil {
		return errors.New("group not found")
	}

	// Auth: only creator can rename the group
	if group.CreatedBy != uID {
		return errors.New("only the group creator can update the group")
	}

	if req.Name == "" {
		return errors.New("group name cannot be empty")
	}

	return s.Repo.UpdateGroupName(gID, req.Name)
}

func (s *GroupService) AddMember(groupID string, userID string, req models.AddMemberRequest) error {
	gID, err := primitive.ObjectIDFromHex(groupID)
	if err != nil {
		return errors.New("invalid group id")
	}

	requestingUser, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return errors.New("invalid user id")
	}

	newMemberID, err := primitive.ObjectIDFromHex(req.UserID)
	if err != nil {
		return errors.New("invalid member user id")
	}

	group, err := s.Repo.GetByID(gID)
	if err != nil {
		return errors.New("group not found")
	}

	// Auth: only existing members can add new members
	if !isMember(group.Members, requestingUser) {
		return errors.New("you are not a member of this group")
	}

	// Validate: check if the user being added actually exists
	_, err = s.UserRepo.GetByID(newMemberID)
	if err != nil {
		return errors.New("user to be added does not exist")
	}

	// Check if already a member
	if isMember(group.Members, newMemberID) {
		return errors.New("user is already a member of this group")
	}

	return s.Repo.AddMember(gID, newMemberID)
}

func (s *GroupService) RemoveMember(groupID string, userID string, targetUserID string) error {
	gID, err := primitive.ObjectIDFromHex(groupID)
	if err != nil {
		return errors.New("invalid group id")
	}

	requestingUser, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return errors.New("invalid user id")
	}

	targetUser, err := primitive.ObjectIDFromHex(targetUserID)
	if err != nil {
		return errors.New("invalid target user id")
	}

	group, err := s.Repo.GetByID(gID)
	if err != nil {
		return errors.New("group not found")
	}

	// Prevent removing the creator
	if targetUser == group.CreatedBy {
		return errors.New("cannot remove the group creator")
	}

	// Auth: only the creator or the user themselves can remove
	if requestingUser != group.CreatedBy && requestingUser != targetUser {
		return errors.New("only the group creator or the member themselves can remove a member")
	}

	if !isMember(group.Members, targetUser) {
		return errors.New("user is not a member of this group")
	}

	return s.Repo.RemoveMember(gID, targetUser)
}

func (s *GroupService) DeleteGroup(groupID string, userID string) error {
	gID, err := primitive.ObjectIDFromHex(groupID)
	if err != nil {
		return errors.New("invalid group id")
	}

	uID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return errors.New("invalid user id")
	}

	group, err := s.Repo.GetByID(gID)
	if err != nil {
		return errors.New("group not found")
	}

	// Auth: only the creator can delete the group
	if group.CreatedBy != uID {
		return errors.New("only the group creator can delete the group")
	}

	// Cascade: delete all expenses and settlements for this group
	if err := s.ExpenseRepo.DeleteByGroupID(gID); err != nil {
		return errors.New("failed to delete group expenses")
	}
	if err := s.SettlementRepo.DeleteByGroupID(gID); err != nil {
		return errors.New("failed to delete group settlements")
	}

	return s.Repo.DeleteGroup(gID)
}

func (s *GroupService) GetGroupsByUserID(userID string) ([]models.Group, error) {
	objID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, errors.New("invalid user id")
	}
	return s.Repo.GetGroupsByUserID(objID)
}

func (s *GroupService) GetUserGroups(userID string) ([]models.Group, error) {
	objID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, errors.New("invalid user id")
	}
	return s.Repo.GetGroupsByUserID(objID)
}
