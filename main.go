package main

import (
	"log"
	"net/http"
	"os"

	"splitwise/config"
	"splitwise/router"
)

func main() {
	config.Connect()
	r := router.SetupRouter()
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Println("Server starting on port", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}
