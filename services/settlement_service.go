package services

import (
	"errors"

	"splitwise/models"
	"splitwise/repository"

	"go.mongodb.org/mongo-driver/bson/primitive"
)
type SettlementService struct {
	Repo       *repository.SettlementRepo
	BalanceSvc *BalanceService
}
func (s *SettlementService) Settle(groupID string, req models.SettleRequest) (*models.Settlement, error) {
	gID, err := primitive.ObjectIDFromHex(groupID)
	if err != nil {
		return nil, errors.New("invalid group id")
	}

	paidBy, err := primitive.ObjectIDFromHex(req.PaidBy)
	if err != nil {
		return nil, errors.New("invalid paid by user id")
	}

	paidTo, err := primitive.ObjectIDFromHex(req.PaidTo)
	if err != nil {
		return nil, errors.New("invalid paid to user id")
	}

	settlement := &models.Settlement{
		GroupID: gID,
		PaidBy:  paidBy,
		PaidTo:  paidTo,
		Amount:  req.Amount,
	}

	if err := s.Repo.CreateSettlement(settlement); err != nil {
		return nil, err
	}
	return settlement, nil
}
func (s *SettlementService) GetGroupSettlements(groupID string) ([]models.Settlement, error) {
	gID, err := primitive.ObjectIDFromHex(groupID)
	if err != nil {
		return nil, errors.New("invalid group id")
	}
	return s.Repo.GetByGroup(gID)
}
func (s *SettlementService) GetUserSettlements(userID string) ([]models.Settlement, error) {
	uID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, errors.New("invalid user id")
	}
	return s.Repo.GetByUser(uID)
}
func (s *SettlementService) DeleteSettlement(settlementID string) error {
	objID, err := primitive.ObjectIDFromHex(settlementID)
	if err != nil {
		return errors.New("invalid settlement id")
	}
	return s.Repo.DeleteSettlement(objID)
}