package services

import (
	"errors"
	"math"

	"splitwise/models"
	"splitwise/repository"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ExpenseService struct {
	Repo      *repository.ExpenseRepo
	GroupRepo *repository.GroupRepo
}

func (s *ExpenseService) AddExpense(groupID string, req models.AddExpenseRequest) (*models.Expense, error) {
	gID, err := primitive.ObjectIDFromHex(groupID)
	if err != nil {
		return nil, errors.New("invalid group id")
	}

	paidBy, err := primitive.ObjectIDFromHex(req.PaidBy)
	if err != nil {
		return nil, errors.New("invalid user id")
	}
	group, err := s.GroupRepo.GetByID(gID)
	if err != nil {
		return nil, errors.New("group not found")
	}

	// Validate payer is a group member
	isMember := false
	memberSet := make(map[primitive.ObjectID]bool)
	for _, m := range group.Members {
		memberSet[m] = true
		if m == paidBy {
			isMember = true
		}
	}
	if !isMember {
		return nil, errors.New("payer must be a member of the group")
	}

	var splits []models.ExpenseSplit

	if req.SplitsType == "equal" {
		share := req.Amount / float64(len(group.Members))
		for _, memberID := range group.Members {
			splits = append(splits, models.ExpenseSplit{
				UserID: memberID,
				Amount: share,
			})
		}
	} else {
		var splitTotal float64
		for _, sp := range req.Splits {
			uid, err := primitive.ObjectIDFromHex(sp.UserID)
			if err != nil {
				return nil, errors.New("invalid split user id")
			}
			if !memberSet[uid] {
				return nil, errors.New("split user must be a member of the group")
			}
			splits = append(splits, models.ExpenseSplit{
				UserID: uid,
				Amount: sp.Amount,
			})
			splitTotal += sp.Amount
		}
		// Validate splits sum to expense amount (allow 0.01 tolerance for rounding)
		if math.Abs(splitTotal-req.Amount) > 0.01 {
			return nil, errors.New("splits must add up to the expense amount")
		}
	}

	expense := &models.Expense{
		GroupID:     gID,
		PaidBy:      paidBy,
		Amount:      req.Amount,
		Description: req.Description,
		Splits:      splits,
	}

	if err := s.Repo.CreateExpense(expense); err != nil {
		return nil, err
	}
	return expense, nil
}
func (s *ExpenseService) GetExpenses(groupID string) ([]models.Expense, error) {
	gID, err := primitive.ObjectIDFromHex(groupID)
	if err != nil {
		return nil, errors.New("invalid group id")
	}
	return s.Repo.GetByGroup(gID)
}
func (s *ExpenseService) DeleteExpense(expenseID string) error {
	objID, err := primitive.ObjectIDFromHex(expenseID)
	if err != nil {
		return errors.New("invalid expense id")
	}
	return s.Repo.DeleteExpense(objID)
}
