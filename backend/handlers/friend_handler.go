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

type FriendHandler struct {
	Service *services.FriendService
}

// SendRequest handles POST /api/friends/request
func (h *FriendHandler) SendRequest(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)

	var req models.FriendRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.FriendID == "" {
		utils.Error(w, http.StatusBadRequest, "friend_id is required")
		return
	}

	friend, err := h.Service.SendRequest(userID, req)
	if err != nil {
		utils.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	utils.Success(w, friend)
}

// AcceptRequest handles PUT /api/friends/{id}/accept
func (h *FriendHandler) AcceptRequest(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	requestID := mux.Vars(r)["id"]

	if err := h.Service.AcceptRequest(userID, requestID); err != nil {
		if err.Error() == "you can only accept requests sent to you" {
			utils.Error(w, http.StatusForbidden, err.Error())
			return
		}
		utils.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	utils.Success(w, map[string]string{"message": "friend request accepted"})
}

// RejectRequest handles PUT /api/friends/{id}/reject
func (h *FriendHandler) RejectRequest(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	requestID := mux.Vars(r)["id"]

	if err := h.Service.RejectRequest(userID, requestID); err != nil {
		if err.Error() == "you can only reject requests sent to you" {
			utils.Error(w, http.StatusForbidden, err.Error())
			return
		}
		utils.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	utils.Success(w, map[string]string{"message": "friend request rejected"})
}

// GetFriends handles GET /api/friends
func (h *FriendHandler) GetFriends(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)

	friends, err := h.Service.GetFriends(userID)
	if err != nil {
		utils.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	if friends == nil {
		friends = []models.FriendResponse{}
	}

	utils.Success(w, friends)
}

// GetPendingRequests handles GET /api/friends/pending
func (h *FriendHandler) GetPendingRequests(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)

	requests, err := h.Service.GetPendingRequests(userID)
	if err != nil {
		utils.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	if requests == nil {
		requests = []models.FriendResponse{}
	}

	utils.Success(w, requests)
}

// GetSentRequests handles GET /api/friends/sent
func (h *FriendHandler) GetSentRequests(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)

	requests, err := h.Service.GetSentRequests(userID)
	if err != nil {
		utils.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	if requests == nil {
		requests = []models.FriendResponse{}
	}

	utils.Success(w, requests)
}

// RemoveFriend handles DELETE /api/friends/{id}
func (h *FriendHandler) RemoveFriend(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	friendshipID := mux.Vars(r)["id"]

	if err := h.Service.RemoveFriend(userID, friendshipID); err != nil {
		if err.Error() == "you are not part of this friendship" {
			utils.Error(w, http.StatusForbidden, err.Error())
			return
		}
		utils.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	utils.Success(w, map[string]string{"message": "friend removed"})
}
