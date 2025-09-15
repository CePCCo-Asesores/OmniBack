import { createServer } from "./server";

const app = createServer();
const PORT = Number(process.env.PORT) || 10000;

// Si usas cookies secure detrás de proxy, descomenta:
// app.set("trust proxy", 1);

app.listen(PORT, () => {
  console.log(`[omniback] Listening on port ${PORT}`);
});

