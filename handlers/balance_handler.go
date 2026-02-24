package handlers

import (
	"net/http"

	"splitwise/middleware"
	"splitwise/services"
	"splitwise/utils"

	"github.com/gorilla/mux"
)
type BalanceHandler struct {
	Service *services.BalanceService
}
func (h *BalanceHandler) GetBalances(w http.ResponseWriter, r *http.Request) {
	groupID := mux.Vars(r)["id"]

	balances, err := h.Service.GetGroupBalances(groupID)
	if err != nil {
		utils.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.Success(w, balances)
}

func (h *BalanceHandler) GetUserBalance(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)

	balances, err := h.Service.GetUserOverallBalance(userID)
	if err != nil {
		utils.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.Success(w, balances)
}