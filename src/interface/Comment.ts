interface UserComment {
	id: string;
	name: string;
	email: string;
	pathname: string;
	site: string;
	comment: string;
}

interface Comment extends UserComment {
	submittedAt: Date;
	approved: boolean;
	approvedAt: Date | null;
}

interface CommentSubmission {
	referer?: string;
	name: string;
	email: string;
	site: string;
	comment: string;
}

export { UserComment, Comment, CommentSubmission };
