import {
	Router,
	Request as ExpressRequest,
	Response as ExpressResponse,
} from "express";

import allowCors from "../../../helper/allowCors";
import {
	redirectToErrorPage,
	redirectToThankYouPage,
	sendError,
} from "../../../helper/redirect";

import { Comment } from "../../../interface/Comment";

import {
	validateIncomingData,
	generateCommentId,
	validateQueryParams,
	getCommentFilePath,
	fixedEncodeURIComponent,
} from "../../../lib/comments";
import { sendEmail } from "../../../lib/mail";
import {
	saveCommentToRepo,
	approveComment,
	deleteComment,
	getCommentData,
} from "../../../lib/repo";

const apiRouter = Router();
const { GITHUB_PAT } = process.env;

apiRouter.post(
	"/comment/new/",
	allowCors((req: ExpressRequest, res: ExpressResponse) => {
		const { referer: browserReferer, origin } = req.headers;
		const fallbackReferer = req.body["fallback-referer"];
		const referer =
			browserReferer && browserReferer !== ""
				? browserReferer
				: fallbackReferer;

		try {
			req.body;
		} catch (error) {
			return res.status(400).json({ error: "Invalid form data." });
		}

		let { name, email, site, comment, age } = req.body;
		let relativeReferrer: string = "";

		if (
			validateIncomingData({
				referer,
				name,
				email,
				site,
				comment,
				age,
			})
		) {
			console.log("Validation successful");

			name = fixedEncodeURIComponent(name);
			email = fixedEncodeURIComponent(email);
			site = fixedEncodeURIComponent(site);
			comment = fixedEncodeURIComponent(comment);
			if (referer) relativeReferrer = new URL(referer).pathname;
		} else {
			redirectToErrorPage(res, origin);
		}

		let commentData: Comment = {
			id: generateCommentId(),
			name,
			email,
			site,
			comment,
			submittedAt: new Date(),
			approved: false,
			approvedAt: null,
			pathname: relativeReferrer
				? relativeReferrer
				: "We could not determine the article this comment was posted to.",
		};

		saveCommentToRepo(commentData)
			.then((response) => {
				if (response.status === 201) {
					console.log(
						"Comment saved to repo. Now let's try sending the email."
					);
					sendEmail(commentData)
						.then((response) => {
							if (response.statusCode === 202) {
								console.log("Email sent successfully.");
								redirectToThankYouPage(res, origin);
							} else {
								console.log(
									"Comment saved, but email could not be sent."
								);
								redirectToErrorPage(res, origin);
							}
						})
						.catch((error) => {
							console.log("Email could not be sent.", error);
							redirectToErrorPage(res, origin);
						});
				} else {
					console.log("Comment could not be saved to repo.");
					redirectToErrorPage(res, origin);
				}
			})
			.catch((err) => {
				console.log("Comment could not be saved to repo.");
				redirectToErrorPage(res, origin);
			});
	})
);

apiRouter.get(
	"/comment/moderate/",
	allowCors((req: ExpressRequest, res: ExpressResponse) => {
		let commentId: string, action: string;

		if (!GITHUB_PAT) {
			sendError(
				res,
				new Error(
					"GitHub personal access token missing from environment!"
				)
			);
		}

		// Required details for moderation
		try {
			// It's possible they may not exist in the query object.
			commentId = req.query.comment_id as string;
			action = req.query.action as string;
			console.log(
				`>>> ${new Date().toLocaleTimeString()} - Request received to ${action} the comment ${commentId}`
			);
		} catch (error) {
			sendError(res, error);
			return;
		}

		if (!validateQueryParams(commentId, action)) {
			sendError(res, new Error("Validation failed"));
			return;
		}

		// Get comment details
		getCommentData(getCommentFilePath(commentId))
			.then((response) => {
				if (response.status === 200) {
					switch (action) {
						case "approve":
							approveComment(response.comment, response.sha)
								.then((response) => {
									res.status(200)
										.send("Comment approved")
										.end();
								})
								.catch((error) => {
									sendError(res, error);
								});
							return;
						case "delete":
							deleteComment(response.comment, response.sha)
								.then((response) => {
									res.status(200)
										.send("Comment deleted")
										.end();
								})
								.catch((error) => {
									sendError(res, error);
								});
							return;
						default:
							console.error(">>> Unknown action specified");
							return;
					}
				} else {
					// Could not get comment data
					throw new Error(
						`>>> Could not get comment data: ${response}`
					);
				}
			})
			.catch((error) => {
				sendError(res, error);
				return;
			});
	})
);

export default apiRouter;
