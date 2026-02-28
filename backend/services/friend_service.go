package services

import (
	"errors"

	"splitwise/models"
	"splitwise/repository"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type FriendService struct {
	Repo     *repository.FriendRepo
	UserRepo *repository.UserRepo
}

// SendRequest sends a friend request from the current user to another user.
func (s *FriendService) SendRequest(userID string, req models.FriendRequest) (*models.Friend, error) {
	requesterID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, errors.New("invalid user id")
	}

	addresseeID, err := primitive.ObjectIDFromHex(req.FriendID)
	if err != nil {
		return nil, errors.New("invalid friend id")
	}

	if requesterID == addresseeID {
		return nil, errors.New("you cannot send a friend request to yourself")
	}

	// Check if the target user exists
	_, err = s.UserRepo.GetByID(addresseeID)
	if err != nil {
		return nil, errors.New("user not found")
	}

	// Check if a friendship already exists between the two users
	existing, err := s.Repo.FindBetween(requesterID, addresseeID)
	if err == nil && existing != nil {
		switch existing.Status {
		case "accepted":
			return nil, errors.New("you are already friends with this user")
		case "pending":
			return nil, errors.New("a friend request already exists between you and this user")
		case "rejected":
			// Allow re-sending by updating the old record
			existing.Requester = requesterID
			existing.Addressee = addresseeID
			existing.Status = "pending"
			if err := s.Repo.UpdateStatus(existing.ID, "pending"); err != nil {
				return nil, err
			}
			return existing, nil
		}
	}

	friend := &models.Friend{
		Requester: requesterID,
		Addressee: addresseeID,
		Status:    "pending",
	}

	if err := s.Repo.Create(friend); err != nil {
		return nil, err
	}
	return friend, nil
}

// AcceptRequest accepts a pending friend request.
func (s *FriendService) AcceptRequest(userID string, requestID string) error {
	uID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return errors.New("invalid user id")
	}

	rID, err := primitive.ObjectIDFromHex(requestID)
	if err != nil {
		return errors.New("invalid request id")
	}

	friend, err := s.Repo.GetByID(rID)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return errors.New("friend request not found")
		}
		return err
	}

	if friend.Addressee != uID {
		return errors.New("you can only accept requests sent to you")
	}

	if friend.Status != "pending" {
		return errors.New("this request is not pending")
	}

	return s.Repo.UpdateStatus(rID, "accepted")
}

// RejectRequest rejects a pending friend request.
func (s *FriendService) RejectRequest(userID string, requestID string) error {
	uID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return errors.New("invalid user id")
	}

	rID, err := primitive.ObjectIDFromHex(requestID)
	if err != nil {
		return errors.New("invalid request id")
	}

	friend, err := s.Repo.GetByID(rID)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return errors.New("friend request not found")
		}
		return err
	}

	if friend.Addressee != uID {
		return errors.New("you can only reject requests sent to you")
	}

	if friend.Status != "pending" {
		return errors.New("this request is not pending")
	}

	return s.Repo.UpdateStatus(rID, "rejected")
}

// GetFriends returns all accepted friends for the current user, enriched with user details.
func (s *FriendService) GetFriends(userID string) ([]models.FriendResponse, error) {
	uID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, errors.New("invalid user id")
	}

	friends, err := s.Repo.GetFriends(uID)
	if err != nil {
		return nil, err
	}

	var result []models.FriendResponse
	for _, f := range friends {
		// The friend is the other user in the relationship
		friendUserID := f.Addressee
		if f.Addressee == uID {
			friendUserID = f.Requester
		}

		user, err := s.UserRepo.GetByID(friendUserID)
		if err != nil {
			continue // skip if user not found
		}

		result = append(result, models.FriendResponse{
			ID:        f.ID,
			User:      user,
			Status:    f.Status,
			CreatedAt: f.CreatedAt,
		})
	}
	return result, nil
}

// GetPendingRequests returns incoming friend requests for the current user.
func (s *FriendService) GetPendingRequests(userID string) ([]models.FriendResponse, error) {
	uID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, errors.New("invalid user id")
	}

	requests, err := s.Repo.GetPendingRequests(uID)
	if err != nil {
		return nil, err
	}

	var result []models.FriendResponse
	for _, f := range requests {
		user, err := s.UserRepo.GetByID(f.Requester)
		if err != nil {
			continue
		}

		result = append(result, models.FriendResponse{
			ID:        f.ID,
			User:      user,
			Status:    f.Status,
			CreatedAt: f.CreatedAt,
		})
	}
	return result, nil
}

// GetSentRequests returns outgoing pending friend requests.
func (s *FriendService) GetSentRequests(userID string) ([]models.FriendResponse, error) {
	uID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, errors.New("invalid user id")
	}

	requests, err := s.Repo.GetSentRequests(uID)
	if err != nil {
		return nil, err
	}

	var result []models.FriendResponse
	for _, f := range requests {
		user, err := s.UserRepo.GetByID(f.Addressee)
		if err != nil {
			continue
		}

		result = append(result, models.FriendResponse{
			ID:        f.ID,
			User:      user,
			Status:    f.Status,
			CreatedAt: f.CreatedAt,
		})
	}
	return result, nil
}

// RemoveFriend removes an accepted friendship or cancels a sent request.
func (s *FriendService) RemoveFriend(userID string, friendshipID string) error {
	uID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return errors.New("invalid user id")
	}

	fID, err := primitive.ObjectIDFromHex(friendshipID)
	if err != nil {
		return errors.New("invalid friendship id")
	}

	friend, err := s.Repo.GetByID(fID)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return errors.New("friendship not found")
		}
		return err
	}

	// Only allow participants to remove the friendship
	if friend.Requester != uID && friend.Addressee != uID {
		return errors.New("you are not part of this friendship")
	}

	return s.Repo.Delete(fID)
}
