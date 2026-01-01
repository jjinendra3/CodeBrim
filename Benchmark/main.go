package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"log"
	"net/http"
	"os"
	"os/signal"
	"sync"
	"sync/atomic"
	"syscall"
	"time"
)

const (
	baseURL       = "http://localhost:5000/code/runcode"
	wsURL         = "ws://localhost:5000"
	concurrency   = 10
	totalRequests = 100
	wsTimeout     = 180 * time.Second
)

type ExecRequest struct {
	ID       string    `json:"id"`
	Name     string    `json:"name"`
	Type     string    `json:"type"`
	Lang     string    `json:"lang"`
	Content  string    `json:"content"`
	Stdin    *string   `json:"stdin"`
	Stdout   *string   `json:"stdout"`
	ParentID *string   `json:"parentId"`
	UserID   string    `json:"userId"`
	Datetime time.Time `json:"datetime"`
}

type MainRequest struct {
	Files ExecRequest `json:"files"`
}

type WSResponse struct {
	Id      string  `json:"id"`
	Success bool    `json:"success"`
	Stderr  *string `json:"stderr"`
	Stdout  string  `json:"stdout"`
}

type Metric struct {
	Start      time.Time
	End        time.Time
	HTTPError  error
	WSReceived bool
}

type Stats struct {
	metrics       sync.Map
	requestsSent  atomic.Int64
	responsesRecv atomic.Int64
	httpErrors    atomic.Int64
	wsConnected   atomic.Bool
}

var stats Stats

func main() {
	fmt.Println("Starting benchmark...")
	fmt.Printf("Config: %d concurrent requests, %d total requests\n", concurrency, totalRequests)

	ctx, cancel := context.WithCancel(context.Background())
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)

	go func() {
		<-sigChan
		fmt.Println("\nShutting down gracefully...")
		cancel()
	}()

	wsDone := make(chan struct{})
	go listenWS(ctx, wsDone)

	fmt.Print("Waiting for WebSocket connection...")
	for i := 0; i < 50; i++ {
		if stats.wsConnected.Load() {
			fmt.Println(" connected!")
			break
		}
		time.Sleep(100 * time.Millisecond)
	}

	if !stats.wsConnected.Load() {
		fmt.Println(" failed to connect")
		return
	}

	startTime := time.Now()
	sem := make(chan struct{}, concurrency)
	var wg sync.WaitGroup

	for i := 0; i < totalRequests; i++ {
		if ctx.Err() != nil {
			break
		}

		wg.Add(1)
		sem <- struct{}{}

		go func(idx int) {
			defer wg.Done()
			defer func() { <-sem }()
			sendRequest(idx)
		}(i)
	}

	wg.Wait()
	totalTime := time.Since(startTime)

	fmt.Println("Waiting for remaining WebSocket responses...")
	time.Sleep(wsTimeout)

	cancel()
	<-wsDone

	printStats(totalTime)
}

func sendRequest(idx int) {
	id := uuid.New().String()

	req := ExecRequest{
		ID:       id,
		Name:     "main.go",
		Type:     "file",
		Lang:     "go",
		Content:  `package main; import "fmt"; func main(){ fmt.Println("hello") }`,
		Stdin:    nil,
		Stdout:   nil,
		UserID:   "edb1a",
		Datetime: time.Now(),
	}

	mainReq := MainRequest{
		Files: req,
	}

	body, _ := json.Marshal(mainReq)

	metric := &Metric{
		Start: time.Now(),
	}
	stats.metrics.Store(id, metric)

	resp, err := http.Post(
		baseURL,
		"application/json",
		bytes.NewBuffer(body),
	)

	if err != nil {
		metric.HTTPError = err
		stats.httpErrors.Add(1)
		log.Printf("Request %d error: %v", idx, err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusAccepted {
		metric.HTTPError = fmt.Errorf("status code: %d", resp.StatusCode)
		stats.httpErrors.Add(1)
		log.Printf("Request %d bad status: %d", idx, resp.StatusCode)
		return
	}

	stats.requestsSent.Add(1)
}

func handleMessage(raw []byte) {
	var msg WSResponse

	if err := json.Unmarshal(raw, &msg); err != nil {
		return
	}

	if msg.Id == "" {
		return
	}

	if val, ok := stats.metrics.Load(msg.Id); ok {
		m := val.(*Metric)
		if !m.WSReceived {
			m.End = time.Now()
			m.WSReceived = true
			stats.responsesRecv.Add(1)
		}
	}
}

func listenWS(ctx context.Context, done chan struct{}) {
	defer close(done)

	conn, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
	if err != nil {
		log.Printf("WS connect failed: %v", err)
		return
	}
	defer conn.Close()

	stats.wsConnected.Store(true)

	go func() {
		<-ctx.Done()
		conn.Close()
	}()

	for {
		_, raw, err := conn.ReadMessage()
		if err != nil {
			if ctx.Err() != nil {
				return
			}
			log.Printf("WS read error: %v", err)
			return
		}
		handleMessage(raw)
	}
}

func printStats(totalTime time.Duration) {
	var durations []time.Duration
	var timeouts int

	stats.metrics.Range(func(_, v any) bool {
		m := v.(*Metric)
		if m.WSReceived && !m.End.IsZero() {
			durations = append(durations, m.End.Sub(m.Start))
		} else if m.HTTPError == nil {
			timeouts++
		}
		return true
	})

	fmt.Println("\n----- RESULTS -----")
	fmt.Printf("Total time: %v\n", totalTime)
	fmt.Printf("Requests sent: %d\n", stats.requestsSent.Load())
	fmt.Printf("Responses received: %d\n", stats.responsesRecv.Load())
	fmt.Printf("HTTP errors: %d\n", stats.httpErrors.Load())
	fmt.Printf("Timeouts (no WS response): %d\n", timeouts)

	if len(durations) == 0 {
		fmt.Println("No completed requests")
		return
	}

	for i := 0; i < len(durations); i++ {
		for j := i + 1; j < len(durations); j++ {
			if durations[j] < durations[i] {
				durations[i], durations[j] = durations[j], durations[i]
			}
		}
	}

	p50 := durations[len(durations)*50/100]
	p95 := durations[len(durations)*95/100]
	p99 := durations[len(durations)*99/100]
	min := durations[0]
	max := durations[len(durations)-1]

	var total time.Duration
	for _, d := range durations {
		total += d
	}
	avg := total / time.Duration(len(durations))

	fmt.Println("\n----- LATENCY -----")
	fmt.Printf("Min: %v\n", min)
	fmt.Printf("Avg: %v\n", avg)
	fmt.Printf("P50: %v\n", p50)
	fmt.Printf("P95: %v\n", p95)
	fmt.Printf("P99: %v\n", p99)
	fmt.Printf("Max: %v\n", max)

	rps := float64(len(durations)) / totalTime.Seconds()
	fmt.Printf("\nThroughput: %.2f req/s\n", rps)
}
