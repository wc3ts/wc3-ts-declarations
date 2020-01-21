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
    // remove CRLF because its messingwith the second regex
    preComment = preComment ? preComment.replace(/\r/g, "").replace(/^(\s*)\/\/(\s*)\*?(\s*)($)?/gm, "") : ""
    postComment = postComment ? postComment.replace(/\r/g, "").replace(/^(\s*)\/\/(\s*)\*?(\s*)($)?/gm, "") : ""
    return `${preComment}\n${postComment}`
}

export function createDocComment(text: string): string {
    text = text.replace("<pre>", "```");
    text = text.replace("</pre>", "```");
    text = text.replace("<br/>", "\n");
    text = text.replace("<br />", "\n");
    text = text.replace("<br>", "\n");

    text = text.replace("'''", "\"");

    // remove lines that only contain ascii art (e.g. ============ or ************)
    text = text.replace(/^[\/\/=*][\/\/=* ]+(\n|$)/gm, "");

    text = text.trim();

    // Replace more than 2 occurences of newlines
    text = text.replace(/\n{2,}/g, "\n\n");

    if (text == "")
    {
        return "";
    }

    text = `/**\n * ${text.replace(/\n/g, "\n * ")} \n */\n`;

    return text;
}

export function indentLines(text: string, indent: number) {
    const tabs = '\t'.repeat(indent);
    return tabs + text.trimEnd().replace(/\n/g, `\n${tabs}`)
}