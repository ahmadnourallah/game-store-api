import app from "./app";
import config from "./config/env.config";

app.listen(config.PORT, () => console.log(`Listening on port ${config.PORT}`));
