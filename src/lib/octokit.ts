import { Octokit } from "@octokit/rest";
const { GITHUB_PAT } = process.env;

if (!GITHUB_PAT) {
	console.error(
		"We need your GitHub Personal Access Token to communicate with your repo."
	);
}

/**
 * @description Initialize Octokit with our details. Create a new instance of octokit, or do nothing if already initialized.
 */
const octokit: Octokit = new Octokit({
	auth: GITHUB_PAT,
	userAgent: "serverless-comment-handler",
	timezone: "Asia/Kolkata",
});

Object.freeze(octokit);

export default octokit;
