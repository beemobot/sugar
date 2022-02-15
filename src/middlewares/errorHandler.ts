import { ErrorRequestHandler } from "express";

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  res.status(500).json({});

  console.log("Unhandled exception caught", {
    errorMessage: "message" in err ? err.message : err,
  });
};

export default errorHandler;
