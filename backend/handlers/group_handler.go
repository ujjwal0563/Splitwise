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

type GroupHandler struct {
	Service *services.GroupService
}

func (h *GroupHandler) GetUserGroups(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)

	groups, err := h.Service.GetGroupsByUserID(userID)
	if err != nil {
		utils.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	if groups == nil {
		groups = []models.Group{}
	}

	utils.Success(w, groups)
}

func (h *GroupHandler) CreateGroup(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)

	var req models.CreateGroupRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.Name == "" {
		utils.Error(w, http.StatusBadRequest, "group name required")
		return
	}

	group, err := h.Service.CreateGroup(userID, req)
	if err != nil {
		utils.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.Success(w, group)
}

func (h *GroupHandler) GetGroup(w http.ResponseWriter, r *http.Request) {
	groupID := mux.Vars(r)["id"]
	userID := middleware.GetUserID(r)

	group, err := h.Service.GetGroup(groupID, userID)
	if err != nil {
		if err.Error() == "you are not a member of this group" {
			utils.Error(w, http.StatusForbidden, err.Error())
			return
		}
		utils.Error(w, http.StatusNotFound, "group not found")
		return
	}

	utils.Success(w, group)
}

func (h *GroupHandler) UpdateGroup(w http.ResponseWriter, r *http.Request) {
	groupID := mux.Vars(r)["id"]
	userID := middleware.GetUserID(r)

	var req models.UpdateGroupRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if err := h.Service.UpdateGroup(groupID, userID, req); err != nil {
		if err.Error() == "only the group creator can update the group" {
			utils.Error(w, http.StatusForbidden, err.Error())
			return
		}
		utils.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	utils.Success(w, map[string]string{"message": "group updated"})
}

func (h *GroupHandler) DeleteGroup(w http.ResponseWriter, r *http.Request) {
	groupID := mux.Vars(r)["id"]
	userID := middleware.GetUserID(r)

	if err := h.Service.DeleteGroup(groupID, userID); err != nil {
		if err.Error() == "only the group creator can delete the group" {
			utils.Error(w, http.StatusForbidden, err.Error())
			return
		}
		utils.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.Success(w, map[string]string{"message": "group deleted"})
}

func (h *GroupHandler) AddMember(w http.ResponseWriter, r *http.Request) {
	groupID := mux.Vars(r)["id"]
	userID := middleware.GetUserID(r)

	var req models.AddMemberRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if err := h.Service.AddMember(groupID, userID, req); err != nil {
		if err.Error() == "you are not a member of this group" {
			utils.Error(w, http.StatusForbidden, err.Error())
			return
		}
		utils.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	utils.Success(w, map[string]string{"message": "member added"})
}

func (h *GroupHandler) RemoveMember(w http.ResponseWriter, r *http.Request) {
	groupID := mux.Vars(r)["id"]
	userID := middleware.GetUserID(r)
	targetUID := mux.Vars(r)["uid"]

	if err := h.Service.RemoveMember(groupID, userID, targetUID); err != nil {
		if err.Error() == "cannot remove the group creator" ||
			err.Error() == "only the group creator or the member themselves can remove a member" {
			utils.Error(w, http.StatusForbidden, err.Error())
			return
		}
		utils.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	utils.Success(w, map[string]string{"message": "member removed"})
}

func (h *GroupHandler) GetUserGroups(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	groups, err := h.Service.GetUserGroups(userID)
	if err != nil {
		utils.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.Success(w, groups)
}
