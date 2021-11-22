import { NextFunction, Request, Response } from "express";

export const processHook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const webhookUrl = req.url;
    console.log(`Webhook received at ${webhookUrl}`);
    console.log(`Body: ${JSON.stringify(req.body)}`);
    return Promise.resolve();
};
