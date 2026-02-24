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
	userRepo       := &repository.UserRepo{}
	groupRepo      := &repository.GroupRepo{}
	expenseRepo    := &repository.ExpenseRepo{}
	settlementRepo := &repository.SettlementRepo{}

	// Services
	userSvc := &services.UserService{Repo: userRepo}
	groupSvc := &services.GroupService{Repo: groupRepo}
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

	// Handlers
	userHandler       := &handlers.UserHandler{Service: userSvc}
	groupHandler      := &handlers.GroupHandler{Service: groupSvc}
	expenseHandler    := &handlers.ExpenseHandler{Service: expenseSvc}
	balanceHandler    := &handlers.BalanceHandler{Service: balanceSvc}
	settlementHandler := &handlers.SettlementHandler{Service: settlementSvc}

	// Router
	r := mux.NewRouter()

	// Public Routes (No Token Needed)
	r.HandleFunc("/api/users/register", userHandler.Register).Methods("POST")
	r.HandleFunc("/api/users/login",    userHandler.Login).Methods("POST")
	r.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK)
    w.Write([]byte(`{"status": "healthy", "message": "Server is running!"}`))
}).Methods("GET")

	// Protected Routes (Token Required)
	protected := r.PathPrefix("/api").Subrouter()
	protected.Use(middleware.AuthMiddleware)

	// User Routes
	protected.HandleFunc("/users/profile",     userHandler.GetProfile).Methods("GET")
	protected.HandleFunc("/users/profile",     userHandler.UpdateProfile).Methods("PUT")
	protected.HandleFunc("/users/settlements", settlementHandler.GetUserSettlements).Methods("GET")
	protected.HandleFunc("/users/balances",    balanceHandler.GetUserBalance).Methods("GET")

	// Group Routes
	protected.HandleFunc("/groups",                    groupHandler.CreateGroup).Methods("POST")
	protected.HandleFunc("/groups/{id}",               groupHandler.GetGroup).Methods("GET")
	protected.HandleFunc("/groups/{id}",               groupHandler.DeleteGroup).Methods("DELETE")
	protected.HandleFunc("/groups/{id}/members",       groupHandler.AddMember).Methods("POST")
	protected.HandleFunc("/groups/{id}/members/{uid}", groupHandler.RemoveMember).Methods("DELETE")

	// Expense Routes
	protected.HandleFunc("/groups/{id}/expenses", expenseHandler.AddExpense).Methods("POST")
	protected.HandleFunc("/groups/{id}/expenses", expenseHandler.GetExpenses).Methods("GET")
	protected.HandleFunc("/expenses/{id}",        expenseHandler.DeleteExpense).Methods("DELETE")

	// Balance Routes
	protected.HandleFunc("/groups/{id}/balances", balanceHandler.GetBalances).Methods("GET")

	// Settlement Routes
	protected.HandleFunc("/groups/{id}/settle",      settlementHandler.Settle).Methods("POST")
	protected.HandleFunc("/groups/{id}/settlements", settlementHandler.GetGroupSettlements).Methods("GET")
	protected.HandleFunc("/settlements/{id}",        settlementHandler.DeleteSettlement).Methods("DELETE")

	// Logger Middleware on everything
	return middleware.LoggerMiddleware(r)
}