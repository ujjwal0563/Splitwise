package router

import (
	"net/http"

	"splitwise/handlers"
	"splitwise/middleware"
	"splitwise/repository"
	"splitwise/services"

	"github.com/gorilla/mux"
)

func SetupRouter() http.Handler {

	// Repos
	userRepo := &repository.UserRepo{}
	groupRepo := &repository.GroupRepo{}
	expenseRepo := &repository.ExpenseRepo{}
	settlementRepo := &repository.SettlementRepo{}
	friendRepo := &repository.FriendRepo{}

	// Services
	userSvc := &services.UserService{Repo: userRepo}
	groupSvc := &services.GroupService{
		Repo:           groupRepo,
		UserRepo:       userRepo,
		ExpenseRepo:    expenseRepo,
		SettlementRepo: settlementRepo,
	}
	balanceSvc := &services.BalanceService{
		ExpenseRepo: expenseRepo,
		GroupRepo:   groupRepo,
	}
	expenseSvc := &services.ExpenseService{
		Repo:      expenseRepo,
		GroupRepo: groupRepo,
	}
	settlementSvc := &services.SettlementService{
		Repo:       settlementRepo,
		BalanceSvc: balanceSvc,
	}
	friendSvc := &services.FriendService{
		Repo:     friendRepo,
		UserRepo: userRepo,
	}

	// Handlers
	userHandler := &handlers.UserHandler{Service: userSvc}
	groupHandler := &handlers.GroupHandler{Service: groupSvc}
	expenseHandler := &handlers.ExpenseHandler{Service: expenseSvc}
	balanceHandler := &handlers.BalanceHandler{Service: balanceSvc}
	settlementHandler := &handlers.SettlementHandler{Service: settlementSvc}
	friendHandler := &handlers.FriendHandler{Service: friendSvc}

	// Router
	r := mux.NewRouter()

	// Public Routes (No Token Needed)
	r.HandleFunc("/api/users/register", userHandler.Register).Methods("POST")
	r.HandleFunc("/api/users/login", userHandler.Login).Methods("POST")
	r.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status": "healthy", "message": "Server is running!"}`))
	}).Methods("GET")

	// Protected Routes (Token Required)
	protected := r.PathPrefix("/api").Subrouter()
	protected.Use(middleware.AuthMiddleware)

	protected.HandleFunc("/users", userHandler.GetAll).Methods("GET")
	protected.HandleFunc("/users/profile", userHandler.GetProfile).Methods("GET")
	protected.HandleFunc("/users/profile", userHandler.UpdateProfile).Methods("PUT")
	protected.HandleFunc("/users/settlements", settlementHandler.GetUserSettlements).Methods("GET")
	protected.HandleFunc("/users/balances", balanceHandler.GetUserBalance).Methods("GET")

	// Group Routes
	protected.HandleFunc("/groups", groupHandler.GetUserGroups).Methods("GET")
	protected.HandleFunc("/groups", groupHandler.CreateGroup).Methods("POST")
	protected.HandleFunc("/groups/{id}", groupHandler.GetGroup).Methods("GET")
	protected.HandleFunc("/groups/{id}", groupHandler.UpdateGroup).Methods("PUT")
	protected.HandleFunc("/groups/{id}", groupHandler.DeleteGroup).Methods("DELETE")
	protected.HandleFunc("/groups/{id}/members", groupHandler.AddMember).Methods("POST")
	protected.HandleFunc("/groups/{id}/members/{uid}", groupHandler.RemoveMember).Methods("DELETE")

	// Expense Routes
	protected.HandleFunc("/groups/{id}/expenses", expenseHandler.AddExpense).Methods("POST")
	protected.HandleFunc("/groups/{id}/expenses", expenseHandler.GetExpenses).Methods("GET")
	protected.HandleFunc("/expenses/{id}", expenseHandler.DeleteExpense).Methods("DELETE")

	// Balance Routes
	protected.HandleFunc("/groups/{id}/balances", balanceHandler.GetBalances).Methods("GET")

	// Settlement Routes
	protected.HandleFunc("/groups/{id}/settle", settlementHandler.Settle).Methods("POST")
	protected.HandleFunc("/groups/{id}/settlements", settlementHandler.GetGroupSettlements).Methods("GET")
	protected.HandleFunc("/settlements/{id}", settlementHandler.DeleteSettlement).Methods("DELETE")

	// Friend Routes
	protected.HandleFunc("/friends", friendHandler.GetFriends).Methods("GET")
	protected.HandleFunc("/friends/request", friendHandler.SendRequest).Methods("POST")
	protected.HandleFunc("/friends/pending", friendHandler.GetPendingRequests).Methods("GET")
	protected.HandleFunc("/friends/sent", friendHandler.GetSentRequests).Methods("GET")
	protected.HandleFunc("/friends/{id}/accept", friendHandler.AcceptRequest).Methods("PUT")
	protected.HandleFunc("/friends/{id}/reject", friendHandler.RejectRequest).Methods("PUT")
	protected.HandleFunc("/friends/{id}", friendHandler.RemoveFriend).Methods("DELETE")

	// Apply middleware: CORS first, then Logger
	return middleware.CORSMiddleware(middleware.LoggerMiddleware(r))
}
