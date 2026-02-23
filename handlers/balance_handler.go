package handlers

import (
    "net/http"

    "splitwise/services"
    "splitwise/utils"
)

type BalanceHandler struct {
    Service *services.BalanceService
}

func (h *BalanceHandler) GetBalances(w http.ResponseWriter, r *http.Request) {
    groupID := r.PathValue("id")

    balances, err := h.Service.GetGroupBalances(groupID)
    if err != nil {
        utils.Error(w, http.StatusInternalServerError, err.Error())
        return
    }

    utils.Success(w, balances)
}