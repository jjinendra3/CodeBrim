import prisma from "../../utils/db";

async function dBUpdate(id: string, stdin: string, stdout: string) {
  try {
    await prisma.files.update({
      where: {
        id: id,
      },
      data: {
        stdin: stdin,
        stdout: stdout,
      },
    });
    return true;
  } catch (error) {
    return false;
  }
}
export { dBUpdate };
