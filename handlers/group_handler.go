package handlers

import (
    "encoding/json"
    "net/http"

    "splitwise/middleware"
    "splitwise/models"
    "splitwise/services"
    "splitwise/utils"
)

type GroupHandler struct {
    Service *services.GroupService
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
    groupID := r.PathValue("id")

    group, err := h.Service.GetGroup(groupID)
    if err != nil {
        utils.Error(w, http.StatusNotFound, "group not found")
        return
    }

    utils.Success(w, group)
}


func (h *GroupHandler) DeleteGroup(w http.ResponseWriter, r *http.Request) {
    groupID := r.PathValue("id")

    if err := h.Service.DeleteGroup(groupID); err != nil {
        utils.Error(w, http.StatusInternalServerError, err.Error())
        return
    }

    utils.Success(w, map[string]string{"message": "group deleted"})
}

func (h *GroupHandler) AddMember(w http.ResponseWriter, r *http.Request) {
    groupID := r.PathValue("id")

    var req models.AddMemberRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        utils.Error(w, http.StatusBadRequest, "invalid request body")
        return
    }

    if err := h.Service.AddMember(groupID, req); err != nil {
        utils.Error(w, http.StatusInternalServerError, err.Error())
        return
    }

    utils.Success(w, map[string]string{"message": "member added"})
}

func (h *GroupHandler) RemoveMember(w http.ResponseWriter, r *http.Request) {
    groupID := r.PathValue("id")
    userID  := r.PathValue("uid")

    if err := h.Service.RemoveMember(groupID, userID); err != nil {
        utils.Error(w, http.StatusInternalServerError, err.Error())
        return
    }

    utils.Success(w, map[string]string{"message": "member removed"})
}