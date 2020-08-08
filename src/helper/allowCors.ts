import {
	Request as ExpressRequest,
	Response as ExpressResponse,
} from "express";

// https://vercel.com/knowledge/how-to-enable-cors
const allowCors = (fn: Function) => async (
	req: ExpressRequest,
	res: ExpressResponse
) => {
	// Only needs to be set when using cookies
	// res.setHeader("Access-Control-Allow-Credentials", true);
	if (!req.headers.origin) res.setHeader("Access-Control-Allow-Origin", "*");
	else res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
	res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
	res.setHeader(
		"Access-Control-Allow-Headers",
		"X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
	);
	if (req.method === "OPTIONS") {
		res.status(200).end();
		return;
	}
	return await fn(req, res);
};

export default allowCors;
