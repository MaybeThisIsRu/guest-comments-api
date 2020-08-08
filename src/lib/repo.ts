import { Comment } from "../interface/Comment";
import octokit from "../lib/octokit";
import { getCommentFilePath } from "../lib/comments";
import { octokitDetails } from "../helper/config";

export const saveCommentToRepo = (commentData: Comment): Promise<any> => {
	console.log("Saving new comment to repo.");
	return new Promise((resolve, reject) => {
		octokit.repos
			.createOrUpdateFileContents({
				owner: octokitDetails.owner,
				repo: octokitDetails.repo,
				path: getCommentFilePath(commentData.id),
				message: "💬 New user-submitted comment",
				content: Buffer.from(JSON.stringify(commentData)).toString(
					"base64"
				), // base64
				committer: {
					name: "serverless-comment-handler",
					email: octokitDetails.email,
				},
				branch: octokitDetails.branch,
			})
			.then((response: { status: number }) => {
				console.log(
					"Response received from saving comment to repo:",
					response
				);
				if (response.status === 201) {
					console.log("Comment submission successful.");
					resolve(response);
				} else {
					console.log("Comment submission NOT successful.");
					reject();
				}
			})
			.catch((err) => {
				console.log("Error while saving comment to repo:", err);
				reject();
			});
	});
};

/**
 * Get exising comment file contents for merging with new comment. If it fails, an empty array is returned with no accompanying SHA.
 */
export const getCommentData = (
	pathToFile: string
): Promise<{ comment: Comment; sha: string; status: number }> =>
	new Promise((resolve, reject) => {
		console.log(">>> Getting comment file contents...");

		octokit.repos
			.getContent({
				owner: octokitDetails.owner,
				repo: octokitDetails.repo,
				path: pathToFile,
				ref: octokitDetails.branch,
			})
			.then(
				(response: {
					status: number;
					data: {
						content: string;
						encoding: string;
						sha: string;
					};
				}) => {
					console.log(">>> Comment received:");
					console.log(response);
					if (response.status === 200) {
						// 200 response
						// Decode from base64 and parse as JSON
						let commentData = JSON.parse(
							Buffer.from(
								response.data.content,
								"base64"
							).toString("utf8")
						);
						// Also send back the SHA of the file as it needs to be provided to API when updating or deleting a file
						resolve({
							comment: commentData,
							sha: response.data.sha,
							status: response.status,
						});
					} else {
						let errorMessage = ">>> Error while receiving comment.";
						if (response.status === 404) {
							errorMessage +=
								" Either the file does not exist (404) or you do not have permission to access it (401).";
						} else {
							errorMessage += ` More details about the error: ${response}`;
						}
						throw new Error(errorMessage);
					}
				}
			)
			.catch((error) => {
				reject(error);
			});
	});

export const approveComment = (
	comment: Comment,
	sha: string
): Promise<boolean> => {
	// Given an SHA checksum, set approved to true and approvedDate to 'now' in UTC
	return new Promise((resolve, reject) => {
		// Update object
		comment.approved = true;
		comment.approvedAt = new Date();

		// Update repo with new object
		octokit.repos
			.createOrUpdateFileContents({
				owner: octokitDetails.owner,
				repo: octokitDetails.repo,
				path: getCommentFilePath(comment.id),
				message: "✅💬 Approve user-submitted comment",
				content: Buffer.from(JSON.stringify(comment)).toString(
					"base64"
				), // base64
				committer: {
					name: "serverless-comment-handler",
					email: octokitDetails.email,
				},
				branch: octokitDetails.branch,
				sha,
			})
			.then((response) => {
				if (response.status === 200 || response.status === 202) {
					console.log(
						`>>> Response from GitHub on comment approval call:`
					);
					console.log(response);
					resolve(true);
				} else {
					throw new Error("Could not create/update file on GitHub.");
				}
			})
			.catch((error) => {
				console.error(error);
				reject(error);
			});
	});
};

export const deleteComment = (
	comment: Comment,
	sha: string
): Promise<object> => {
	return new Promise((resolve, reject) => {
		octokit.repos
			.deleteFile({
				owner: octokitDetails.owner,
				repo: octokitDetails.repo,
				path: getCommentFilePath(comment.id),
				message: "🗑💬 Delete user-submitted comment",
				committer: {
					name: "serverless-comment-handler",
					email: octokitDetails.email,
				},
				branch: octokitDetails.branch,
				sha,
			})
			.then((response: { status: number }) => {
				console.log(
					`>>> Response received from comment deletion request.`
				);
				if (response.status === 200) {
					console.log(`>>> Comment successfuly deleted`);
					resolve(response);
				} else {
					throw new Error(
						"An error occured on GitHub's end while deleting the comment"
					);
				}
			})
			.catch((error) => {
				console.error(`>>> ${error}`);
				reject(error);
			});
	});
};
