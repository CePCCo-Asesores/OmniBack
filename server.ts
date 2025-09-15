import { limiter } from './middleware/rateLimiter';
import { sanitizeInput } from './middleware/sanitize';
import { corsConfig } from './middleware/cors';

app.use(limiter);
app.use(sanitizeInput);
app.use(corsConfig);
