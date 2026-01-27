import { spawn } from "node:child_process";
import path from "node:path";

const pythonDir = path.resolve("../python-twikit/.venv/bin/python");

export default function runPythonScript(
  scriptDir: string,
  ...args: any[]
): Promise<any> {
  return new Promise((resolve, reject) => {
    const fullScriptDir = path.resolve(`../python-twikit/src/${scriptDir}.py`);

    const pyProcess = spawn(pythonDir, [fullScriptDir, ...args], {
      cwd: path.resolve("../python-twikit"), // so that Python can find cookies.json
    });

    let data = "";

    pyProcess.stdout.on("data", (chunk) => {
      const newData = chunk.toString() as string;
      if (!/^\[(INFO|WARN|ERROR|DEBUG)\]/.test(newData)) {
        data += newData;
      }
    });

    pyProcess.stderr.on("data", (chunk) => {
      console.log(chunk.toString());
    });

    pyProcess.on("close", (code) => {
      if (code !== 0) {
        return reject(new Error(`Python process exited with code ${code}\n\n`));
      }

      try {
        const result = JSON.parse(data);
        resolve(result);
      } catch (e) {
        reject(new Error("Failed to parse Python output as JSON\n\n"));
      }
    });
  });
}
