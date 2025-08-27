package constants

func LanguageContent(lang string) string {
	switch lang {
	case "c":
		return `#include <stdio.h> 
int main() 
{ 
	printf("Hello World!"); 
	return 0; 
}`
	case "cpp":
		return `#include <iostream> 
using namespace std; 
int main() 
{ 
	cout << "Hello World!"; 
	return 0; 
}`
	case "python":
		return `print("Hello World!")`
	case "javascript":
		return `console.log("Hello World!")`
	case "go":
		return `package main 
import "fmt" 
func main() { 
	fmt.Println("Hello World!") 
}`
	case "java":
		return `class Main { 
	public static void main(String[] args) { 
		System.out.println("Hello World!"); 
	} 
}`
	default:
		return "Hello World!"
	}
}
