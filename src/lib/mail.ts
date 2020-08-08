import sgMail from "@sendgrid/mail";

import { siteDetails } from "../helper/config";
import { Comment } from "../interface/Comment";
import { SendGridMessage, SendGridResponse } from "../interface/SendGrid";

const { SENDGRID_API_KEY, NODE_ENV, PORT } = process.env;

if (SENDGRID_API_KEY) {
	sgMail.setApiKey(SENDGRID_API_KEY);
} else {
	console.error(
		"We need your SendGrid API key to send you notification emails."
	);
}

export const sendEmail = (commentData: Comment): Promise<any> =>
	new Promise((resolve, reject) => {
		console.log(`>>> Sending email to notify site owner...`);

		let host = "https://comments.runnr.work";
		if (NODE_ENV !== "production") host = `http://localhost:${PORT}`;

		const functionsBaseUrl = `${host}/api/v1/comment/moderate?comment_id=${commentData.id}&action={action}`;
		const deleteFnUrl = functionsBaseUrl.replace("{action}", `delete`);
		const approveFnUrl = functionsBaseUrl.replace("{action}", `approve`);

		const msg: SendGridMessage = {
			to: siteDetails.ownerEmail,
			from: siteDetails.ownerEmail,
			subject: `New comment received on ${siteDetails.siteName}`,
			text: `You have received a new comment, details as follows:
						Site: ${siteDetails.siteName}
						Comment Author: ${commentData.name}
						Author Email: ${commentData.email}
						Comment: ${commentData.comment}
						Submitted at: ${commentData.submittedAt}
						Page: ${commentData.pathname}
						Delete comment: ${deleteFnUrl}
						Approve comment: ${approveFnUrl}`,
			html: `<p>You have received a new comment, details as follows:</p>
						<p><strong>Site:</strong> <pre>${siteDetails.siteName}</pre></p>
						<p><strong>Comment Author:</strong> <pre>${commentData.name}</pre></p>
						<p><strong>Author Email:</strong> <pre>${commentData.email}</pre></p>
						<p><strong>Comment:</strong> <pre>${commentData.comment}</pre></p>
						<p><strong>Submitted at:</strong> <pre>${commentData.submittedAt}</pre></p>
						<p><strong>Referrer:</strong> <pre>${commentData.pathname}</pre></p>
						<p>Please <a href="${approveFnUrl}">approve</a> or <a href="${deleteFnUrl}">delete</a>.</p>`,
		};

		sgMail
			.send(msg)
			.then((response) => {
				// API docs indicate a 202 response with null data ('body') on success
				// https://sendgrid.api-docs.io/v3.0/mail-send/v3-mail-send
				if ((response[0] as SendGridResponse).statusCode === 202) {
					console.log(`>>> Email successfully sent to site owner.`);
					console.log(response);
					resolve(response[0]);
				} else {
					console.log(`>>> Could not send email to site owner`);
					console.error(response);
					reject(response);
				}
			})
			.catch((error: any) => {
				console.error(`>>> Could not send email to site owner`);
				console.error(error);
				reject(error);
			});
	});
