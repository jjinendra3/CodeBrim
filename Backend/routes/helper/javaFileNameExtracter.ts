export const javaClassName = (javaCode: string): string => {
  const match = /class\s+([A-Za-z_][A-Za-z0-9_]*)\s*\{/.exec(javaCode);
  return match ? match[1] : "Main";
};
