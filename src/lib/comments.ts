import validator from "validator";
import { v4 as uuidv4 } from "uuid";
import { CommentSubmission } from "../interface/Comment";
const NODE_ENV = process.env.NODE_ENV || "production";

/**
 * @description Validate form and header data
 */
export const validateIncomingData = ({
	referer,
	name,
	email,
	site,
	comment,
	age,
}: CommentSubmission): boolean => {
	try {
		console.log("Validating inputs...");

		if (!validator.isEmpty(age))
			throw new Error("Honeypot filled. Probably a bot!");

		if (validator.isEmpty(name)) throw new Error("Name is empty.");

		if (validator.isEmpty(email) || !validator.isEmail(email))
			throw new Error("Email is either empty or invalid.");

		if (!validator.isEmpty(site) && !validator.isURL(site))
			throw new Error("Site is not a valid URL.");

		if (referer) {
			if (
				validator.isEmpty(referer) ||
				!validator.isURL(referer, {
					// localhost doesn't have a tld
					require_tld: NODE_ENV === "production" ? true : false,
				})
			)
				throw new Error("Referrer is either empty or an invalid URL.");
		} else {
			throw new Error("Referrer info not available");
		}

		if (validator.isEmpty(comment)) throw new Error("Comment is empty.");

		return true;
	} catch (error) {
		console.error("Validation failed:", error);
		return false;
	}
};

/**
 * @description Generate a unique comment id
 */
export const generateCommentId = (): string => {
	return uuidv4();
};

export const validateQueryParams = (
	commentId: string,
	action: string
): boolean => {
	try {
		// uuidv4 -> '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'
		// Loose check by comparing length first, then checking pattern using RegEx

		if (commentId.trim().length !== 36)
			throw new Error("Comment ID did not meet the expected length");

		if (
			!commentId
				.trim()
				.match(/^[\w\d]{8}-[\w\d]{4}-[\w\d]{4}-[\w\d]{4}-[\w\d]{12}$/g)
		)
			throw new Error("Comment ID did not match the expected format.");

		// Action shall only be one of the predefined actions
		console.log(action, typeof action);
		if (!["approve", "delete"].includes(action.trim()))
			throw new Error("Comment action is not what we expected.");

		return true;
	} catch (error) {
		console.error(`>>> ${error}`);
		return false;
	}
};

/**
 * @description Get the path to the comments file on the repo
 */
export const getCommentFilePath = (commentId: string): string => {
	return `cache/comments/${commentId}.json`;
};

/**
 * @description For application/x-www-form-urlencoded, spaces are to be replaced by "+", so one may wish to follow a encodeURIComponent() replacement with an additional replacement of "%20" with "+".
 * To be more stringent in adhering to RFC 3986 (which reserves !, ', (, ), and *), even though these characters have no formalized URI delimiting uses, the following can be safely used.
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
 */
export const fixedEncodeURIComponent = (str: string): string => {
	return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
		return "%" + c.charCodeAt(0).toString(16);
	});
};
