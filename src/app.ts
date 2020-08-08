import express from "express";

import apiv1Router from "./routes/api/v1";

const app = express();
const port = 4000 || process.env.PORT;

app.use(express.urlencoded({ extended: false }));

app.use("/api/v1", apiv1Router);

app.listen(port, () => {
	console.log(`web-comments listening at http://localhost:${port}`);
});
