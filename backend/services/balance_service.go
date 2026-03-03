package services

import (
	"errors"
	"math"
	"sort"

	"splitwise/models"
	"splitwise/repository"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type BalanceService struct {
	ExpenseRepo    *repository.ExpenseRepo
	GroupRepo      *repository.GroupRepo
	SettlementRepo *repository.SettlementRepo
}

func (s *BalanceService) GetGroupBalances(groupID string) ([]models.BalanceDetail, error) {
	gID, err := primitive.ObjectIDFromHex(groupID)
	if err != nil {
		return nil, errors.New("invalid group id")
	}
	expenses, err := s.ExpenseRepo.GetByGroup(gID)
	if err != nil {
		return nil, err
	}
	net := make(map[primitive.ObjectID]float64)
	for _, expense := range expenses {
		net[expense.PaidBy] += expense.Amount
		for _, split := range expense.Splits {
			net[split.UserID] -= split.Amount
		}
	}

	// Factor in settlements: a settlement means PaidBy paid PaidTo
	settlements, err := s.SettlementRepo.GetByGroup(gID)
	if err != nil {
		return nil, err
	}
	for _, st := range settlements {
		net[st.PaidBy] += st.Amount
		net[st.PaidTo] -= st.Amount
	}

	return minimizeTransactions(net), nil
}
func (s *BalanceService) GetUserOverallBalance(userID string) ([]models.BalanceDetail, error) {
	uID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, err
	}

	groups, err := s.GroupRepo.GetGroupsByUserID(uID)
	if err != nil {
		return nil, err
	}

	net := make(map[primitive.ObjectID]float64)

	for _, group := range groups {
		expenses, err := s.ExpenseRepo.GetByGroup(group.ID)
		if err != nil {
			continue
		}
		for _, expense := range expenses {
			net[expense.PaidBy] += expense.Amount
			for _, split := range expense.Splits {
				net[split.UserID] -= split.Amount
			}
		}

		// Factor in settlements for this group
		settlements, err := s.SettlementRepo.GetByGroup(group.ID)
		if err != nil {
			continue
		}
		for _, st := range settlements {
			net[st.PaidBy] += st.Amount
			net[st.PaidTo] -= st.Amount
		}
	}

	return minimizeTransactions(net), nil
}

func minimizeTransactions(net map[primitive.ObjectID]float64) []models.BalanceDetail {
	type Entry struct {
		UserID primitive.ObjectID
		Amount float64
	}
	var creditors []Entry
	var debtors []Entry

	for userID, amount := range net {
		if amount > 0.01 {
			creditors = append(creditors, Entry{userID, amount})
		} else if amount < -0.01 {

			debtors = append(debtors, Entry{userID, -amount})
		}
	}

	// Sort for deterministic results (largest amounts first)
	sort.Slice(creditors, func(i, j int) bool { return creditors[i].Amount > creditors[j].Amount })
	sort.Slice(debtors, func(i, j int) bool { return debtors[i].Amount > debtors[j].Amount })

	var result []models.BalanceDetail
	i, j := 0, 0
	for i < len(debtors) && j < len(creditors) {
		amount := math.Min(debtors[i].Amount, creditors[j].Amount)

		result = append(result, models.BalanceDetail{
			FromUserID: debtors[i].UserID.Hex(),
			ToUser:     creditors[j].UserID.Hex(),
			Amount:     math.Round(amount*100) / 100,
		})

		debtors[i].Amount -= amount
		creditors[j].Amount -= amount

		if debtors[i].Amount < 0.01 {
			i++
		}
		if creditors[j].Amount < 0.01 {
			j++
		}
	}

	return result
}
