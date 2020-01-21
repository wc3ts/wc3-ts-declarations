// WTF
const preCommentRegexString = `(?<pre_comment>^\\s*(?:\\/\\/.*\\s+)+)?^\\s*`;
const postCommentRegexString = `(?<post_comment>[^\\S\\r\\n]+\\/\\/.*)?(?:\\n|$)`;

export const jTypeRegex = new RegExp(`${preCommentRegexString}type\\s+(?<name>\\w+)\\s+extends\\s+(?<parent>\\w+)${postCommentRegexString}`, "gm");
export const jFunctionRegex = new RegExp(`${preCommentRegexString}(?:(?<constant>constant)\\s+)?(?:(?:(?:native)|(?:function))\\s+)(?<name>\\w+)\\s+takes\\s+(?<parameters>.+)returns\\s+(?<return_type>\\w+)${postCommentRegexString}`, "gm");
export const jParameterRegex = /((?<type>\w+) (?<name>\w+))/gm
export const jVariableRegex = new RegExp(`${preCommentRegexString}(?:(?<constant>constant)\\s+)?(?<type>\\w+)\\s+(?:(?<array>array)\\s+)?(?<name>\\w+)\\s+(?:=\\s+(?<value>[\\w()''""]+))?${postCommentRegexString}`, "gm");

export interface JassEntry {
    description: string,
    identifier: string,
}

export interface JassType extends JassEntry {
    parent?: string
}

export interface JassParameter {
    identifier: string,
    type: string
}

export interface JassFunction extends JassEntry  {
    isConstant: boolean,
    parameters: Array<JassParameter>,
    returnType: string
}

export interface JassVariable extends JassEntry {
    type: string,
    value?: string,
    isArray: boolean,
    isConstant: boolean,
}

export const JassCoreTypes = ["boolean", "real", "integer", "string"];

export function mapJasstoTsType(type: string) {
    const typeMap = {
        nothing: "void",
        integer: "number",
        real: "number",
        code: "() => void"
    }
    return typeMap[type] ? typeMap[type] : type
}