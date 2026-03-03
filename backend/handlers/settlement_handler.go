package handlers

import (
	"encoding/json"
	"net/http"

	"splitwise/middleware"
	"splitwise/models"
	"splitwise/services"
	"splitwise/utils"

	"github.com/gorilla/mux"
)

type SettlementHandler struct {
	Service *services.SettlementService
}

func (h *SettlementHandler) Settle(w http.ResponseWriter, r *http.Request) {
	groupID := mux.Vars(r)["id"]

	var req models.SettleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.Amount <= 0 {
		utils.Error(w, http.StatusBadRequest, "amount must be greater than 0")
		return
	}
	if req.PaidBy == "" || req.PaidTo == "" {
		utils.Error(w, http.StatusBadRequest, "paid_by and paid_to are required")
		return
	}
	if req.PaidBy == req.PaidTo {
		utils.Error(w, http.StatusBadRequest, "payer and payee must be different")
		return
	}

	settlement, err := h.Service.Settle(groupID, req)
	if err != nil {
		utils.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.Success(w, settlement)
}

func (h *SettlementHandler) GetGroupSettlements(w http.ResponseWriter, r *http.Request) {
	groupID := mux.Vars(r)["id"]

	settlements, err := h.Service.GetGroupSettlements(groupID)
	if err != nil {
		utils.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.Success(w, settlements)
}

func (h *SettlementHandler) DeleteSettlement(w http.ResponseWriter, r *http.Request) {
	settlementID := mux.Vars(r)["id"]

	if err := h.Service.DeleteSettlement(settlementID); err != nil {
		utils.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.Success(w, map[string]string{"message": "settlement deleted"})
}
func (h *SettlementHandler) GetUserSettlements(w http.ResponseWriter, r *http.Request) {
	settlements, err := h.Service.GetUserSettlements(
		middleware.GetUserID(r),
	)
	if err != nil {
		utils.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.Success(w, settlements)
}
