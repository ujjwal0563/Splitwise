package handlers

import (
    "encoding/json"
    "net/http"

    "splitwise/models"
    "splitwise/services"
    "splitwise/utils"

    "github.com/gorilla/mux"
)

type ExpenseHandler struct {
    Service *services.ExpenseService
}

func (h *ExpenseHandler) AddExpense(w http.ResponseWriter, r *http.Request) {
    groupID := mux.Vars(r)["id"]

    var req models.AddExpenseRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        utils.Error(w, http.StatusBadRequest, "invalid request body")
        return
    }

    if req.Amount <= 0 {
        utils.Error(w, http.StatusBadRequest, "amount must be greater than 0")
        return
    }
    if req.PaidBy == "" {
        utils.Error(w, http.StatusBadRequest, "paid_by is required")
        return
    }
    if req.SplitsType != "equal" && len(req.Splits) == 0 {
        utils.Error(w, http.StatusBadRequest, "splits required for custom split")
        return
    }

    expense, err := h.Service.AddExpense(groupID, req)
    if err != nil {
        utils.Error(w, http.StatusInternalServerError, err.Error())
        return
    }

    utils.Success(w, expense)
}

func (h *ExpenseHandler) GetExpenses(w http.ResponseWriter, r *http.Request) {
    groupID := mux.Vars(r)["id"]

    expenses, err := h.Service.GetExpenses(groupID)
    if err != nil {
        utils.Error(w, http.StatusInternalServerError, err.Error())
        return
    }

    utils.Success(w, expenses)
}

func (h *ExpenseHandler) DeleteExpense(w http.ResponseWriter, r *http.Request) {
    expenseID := mux.Vars(r)["id"]

    if err := h.Service.DeleteExpense(expenseID); err != nil {
        utils.Error(w, http.StatusInternalServerError, err.Error())
        return
    }

    utils.Success(w, map[string]string{"message": "expense deleted"})
}