FROM golang:1.22

# Precompile commonly used standard packages so each run only compiles the
# user's file. Built once at deploy as `codebrim-go`.
RUN printf 'package main\nimport (\n_ "bufio"\n_ "fmt"\n_ "math"\n_ "os"\n_ "sort"\n_ "strconv"\n_ "strings"\n)\nfunc main() {}\n' > /tmp/warm.go \
 && go build -o /dev/null /tmp/warm.go \
 && rm /tmp/warm.go
