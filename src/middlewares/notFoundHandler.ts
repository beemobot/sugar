import { RequestHandler } from "express";

const errorHandler: RequestHandler = (req, res, _next) => {
  console.log("Invalid URL", {
    path: req.path,
    ip: req.ip,
  });

  res.status(404).json({});
};

export default errorHandler;
