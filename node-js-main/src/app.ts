import express from "express";
import { env } from "./config/env.js";
import { targetUsersController } from "./targetUsers/targetUsers.controller.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import { scrapperController } from "./scrapper/scrapper.controller.js";

const PORT = env.PORT;
const app = express();

app.use(express.json());

app.post("/target-users", targetUsersController.create);
app.patch("/target-users/:screen_name", targetUsersController.update);
app.delete("/target-users", targetUsersController.deleteMany);
app.get("/target-users", targetUsersController.getAll);

app.post("/start", scrapperController.start);
app.post("/stop", scrapperController.stop);

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
