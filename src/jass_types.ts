// WTF
const preCommentRegexString = `(?<pre_comment>^\\s*(?:\\/\\/.*\\s+)+)?^\\s*`;
const postCommentRegexString = `(?<post_comment>[^\\S\\r\\n]+\\/\\/.*)?(?:\\n|$)`;

/* eslint-disable */

export const jTypeRegex = new RegExp(`${preCommentRegexString}type\\s+(?<name>\\w+)\\s+extends\\s+(?<parent>\\w+)${postCommentRegexString}`, "gm");
export const jFunctionRegex = new RegExp(`${preCommentRegexString}(?:(?<constant>constant)\\s+)?(?:(?:(?:native)|(?:function))\\s+)(?<name>\\w+)\\s+takes\\s+(?<parameters>.+)returns\\s+(?<return_type>\\w+)${postCommentRegexString}`, "gm");
export const jParameterRegex = /((?<type>\w+) (?<name>\w+))/gm
export const jVariableRegex = new RegExp(`${preCommentRegexString}(?:(?<constant>constant)\\s+)?(?<type>\\w+)\\s+(?:(?<array>array)\\s+)?(?<name>\\w+)\\s+(?:=\\s+(?<value>[\\w()''""]+))?${postCommentRegexString}`, "gm");

/* eslint-enable */

export enum JassEntryKind
	{
	JassType = 'type',
	JassFunction = 'function',
	JassVariable = 'variable'
}

export interface JassEntry
{
	kind: JassEntryKind,
	description: string,
	identifier: string,
}

export interface JassType extends JassEntry
{
	kind: JassEntryKind.JassType,
	parent?: string
}

export interface JassFunction extends JassEntry
{
	kind: JassEntryKind.JassFunction,
	isConstant: boolean,
	parameters: JassParameter[],
	returnType: string
}

export interface JassVariable extends JassEntry
{
	kind: JassEntryKind.JassVariable,
	type: string,
	value?: string,
	isArray: boolean,
	isConstant: boolean,
}

export interface JassParameter
{
	identifier: string,
	type: string
}

export const JassCoreTypes = [
	'boolean',
	'real',
	'integer',
	'string'
];

export function mapJasstoTsType(type: string)
{
	const typeMap = {
		nothing: 'void',
		integer: 'number',
		real: 'number',
		code: '() => void'
	};
	return typeMap[type] ? typeMap[type] : type;
}
