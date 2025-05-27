export function languageContent(lang: string) {
  switch (lang) {
    case "c":
      return `#include <stdio.h> \nint main() \n{ \n\tprintf("Hello World!"); \n\treturn 0; \n}`;
    case "cpp":
      return `#include <iostream> \nusing namespace std; \nint main() \n{ \n\tcout << "Hello World!"; \n\treturn 0; \n}`;
    case "python":
      return `print("Hello World!")`;
    case "javascript":
      return `console.log("Hello World!")`;
    case "go":
      return `package main \nimport "fmt" \nfunc main() { \n\tfmt.Println("Hello World!") \n}`;
    case "java":
      return `class Main { \n\tpublic static void main(String[] args) { \n\t\tSystem.out.println("Hello World!"); \n\t} \n}`;
    default:
      return "Hello World!";
  }
}
