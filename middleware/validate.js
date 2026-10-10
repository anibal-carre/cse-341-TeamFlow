export function validateBody(validator) {
  return (req, res, next) => {
    const result = validator(req.body);
    if (!result.valid) {
      return res.status(400).json({
        error: "Validation Error",
        message: "Request body is invalid.",
        details: result.errors
      });
    }
    req.validatedBody = result.value;
    next();
  };
}