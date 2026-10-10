export function notFoundHandler(req, res, next) {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.method} ${req.originalUrl} does not exist.`
  });
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  const status = Number.isInteger(err.status) ? err.status : 500;
  const message = status >= 500 ? "An unexpected server error occurred." : err.message;

  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({
    error: err.name || "Error",
    message,
    ...(err.details ? { details: err.details } : {})
  });
}