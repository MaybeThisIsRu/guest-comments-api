import { Response as ExpressResponse } from "express";

export const redirectToErrorPage = function (
	res: ExpressResponse,
	origin: string | undefined
): void {
	console.log(`>>> Redirecting to the error page.`);
	if (origin) {
		res.status(301).setHeader("Location", `${origin}/error/`);
		res.end();
		return;
	}
	res.sendStatus(500);
};

export const redirectToThankYouPage = function (
	res: ExpressResponse,
	origin: string | undefined
): void {
	console.log(`>>> Redirecting to the thank-you page.`);
	if (origin) {
		res.status(301).setHeader("Location", `${origin}/thank-you/`);
		res.end();
		return;
	}
	res.sendStatus(500);
};

export const sendError = (res: ExpressResponse, error: Error) => {
	console.log(
		`>>> Error occured. Responding with HTTP 500. Error message: ${error.message}.`
	);
	res.sendStatus(500);
};
