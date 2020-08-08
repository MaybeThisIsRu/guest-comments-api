interface SendGridMessage {
	to: string;
	from: string;
	subject: string;
	text: string;
	html: string;
}

interface SendGridResponse {
	statusCode: number;
}

interface SendGridError {
	errors: [
		{
			field: string;
			message: string;
			error_id?: string;
			help?: {};
		}
	];
	id?: string;
}

export {
	SendGridMessage,
	SendGridResponse,
	SendGridError
};
