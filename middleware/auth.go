package middleware
import (
	"context"
	"net/http"
	"strings"

	"splitwise/utils"
)
type contextKey string
const UserIDKey contextKey = "userID"
func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			utils.Error(w, http.StatusUnauthorized, "missing authorization header")
			return
		}
		if !strings.HasPrefix(authHeader, "Bearer ") {
			utils.Error(w, http.StatusUnauthorized, "invalid authorization format")
			return
		}
		token := strings.TrimPrefix(authHeader, "Bearer ")
		if token == ""{
			utils.Error(w, http.StatusUnauthorized, "Token missing")
			return
		}
		userID, err := utils.ParseJWT(token)
		if err != nil {
			utils.Error(w, http.StatusUnauthorized, "invalid token")
			return
		}
		ctx := context.WithValue(r.Context(), UserIDKey, userID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
func GetUserID(r *http.Request) (string){
	userID,_:= r.Context().Value(UserIDKey).(string)
	return userID
}