import util from "node:util";

export default function complexLog(obj: object) {
  console.log(
    util.inspect(obj, {
      depth: null,
      colors: true,
      maxArrayLength: null,
    }),
  );
}
