import rateLimit from 'express-rate-limit';

export const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 100,             // 100 peticiones por IP
  message: 'Demasiadas solicitudes. Intenta más tarde.'
});
