package utils
import (
	"errors"
    "os"
    "time"

    "github.com/golang-jwt/jwt/v5"
)

func GenerateJWT(userID string) (string, error) {
    claims := jwt.MapClaims{
        "user_id": userID,
        "exp":     time.Now().Add(24 * time.Hour).Unix(),
    }
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString([]byte(os.Getenv("JWT_SECRET")))
}

func ParseJWT(tokenStr string) (string, error) {
    token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
        return []byte(os.Getenv("JWT_SECRET")), nil
    })
    if err != nil || !token.Valid {
        return "", errors.New("invalid token")
    }
    claims := token.Claims.(jwt.MapClaims)
    userID := claims["user_id"].(string)
    return userID, nil
}