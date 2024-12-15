import * as fs from "fs";
function findClassName(javaCode: string): string | null {
  const classRegex = /class\s+([A-Za-z_][A-Za-z0-9_]*)\s*\{/g;
  const match = classRegex.exec(javaCode);
  return match ? match[1] : null;
}
export const javaFileNameExtracter = (code: string) => {
  const fileName = findClassName(code);
  const dockerFileContent = `FROM openjdk:11
          COPY . /usr/src/myapp
          WORKDIR /usr/src/myapp
          RUN javac ${fileName}.java
          CMD ["java", "${fileName}"]`;
  fs.writeFileSync(`./dock/java/Dockerfile`, dockerFileContent);
  return fileName;
};
