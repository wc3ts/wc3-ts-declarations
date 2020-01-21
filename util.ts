export function groupBy<T>(arr: Array<T>, criteria: ((element: T) => string) | string): Record<string, Array<T>>{
	return arr.reduce(function (obj, item) {
		var key = typeof criteria === 'function' ? criteria(item) : item[criteria];
		if (!obj.hasOwnProperty(key)) {
			obj[key] = [];
		}
		obj[key].push(item);
		return obj;
	}, {});
};

export function combineComments(preComment: string | undefined, postComment: string | undefined): string {
    // TODO better removal of slashes
    preComment = preComment ? preComment : ""
    postComment = postComment ? postComment : ""
    return `${preComment}\n${postComment}`.replace("// ", "").replace("//", "");
}

export function createDoccomment(text: string): string {
    text = text.replace("<pre>", "```");
    text = text.replace("</pre>", "```");
    text = text.replace("<br/>", "\n");
    text = text.replace("<br />", "\n");
    text = text.replace("<br>", "\n");

    text = text.replace("'''", "\"");

    text = text.trim();

    // Replace more than 2 occurences of newlines
    text = text.replace(/\n{2,}/g, "\n\n");

    if (text == "")
    {
        return "";
    }
    return `/**\n * ${text.replace("\n", "\n * ")} \n */\n`;
}