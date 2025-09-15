import { Request, Response, NextFunction } from "express";

/**
 * Middleware de validación sin dependencia externa.
 * Acepta:
 *  - Un objeto con .safeParse(data) -> { success, data, error }
 *  - Un objeto con .parse(data) que lanza si es inválido
 *  - Una función (data) -> { success, data, error }
 */
type SchemaLike =
  | {
      safeParse?: (data: any) => { success: boolean; data: any; error?: any };
      parse?: (data: any) => any;
    }
  | ((data: any) => { success: boolean; data: any; error?: any });

export function validateBody(schema: SchemaLike) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (typeof schema === "function") {
        const result = (schema as any)(req.body);
        if (result && result.success) {
          req.body = result.data;
          return next();
        }
        return res
          .status(400)
          .json({ error: "ValidationError", details: result?.error ?? "invalid body" });
      }

      const s = schema as any;

      if (typeof s.safeParse === "function") {
        const parsed = s.safeParse(req.body);
        if (parsed.success) {
          req.body = parsed.data;
          return next();
        }
        return res.status(400).json({ error: "ValidationError", details: parsed.error });
      }

      if (typeof s.parse === "function") {
        try {
          const data = s.parse(req.body);
          req.body = data;
          return next();
        } catch (err: any) {
          return res
            .status(400)
            .json({ error: "ValidationError", details: err?.issues ?? err?.message ?? "invalid body" });
        }
      }

      // Si no hay esquema válido, deja pasar
      return next();
    } catch (err: any) {
      return res
        .status(400)
        .json({ error: "ValidationError", details: err?.message ?? "invalid body" });
    }
  };
}

export default validateBody;

